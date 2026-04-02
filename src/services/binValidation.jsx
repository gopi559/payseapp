import { EXTERNAL_BIN_LIST } from '../utils/constant'
import { fetchWithBasicAuth } from './basicAuth.service.js'

export const BIN_VALIDATION_RULES = {
  CASH_IN: ['Bank', 'EMI'],
  CASH_OUT: ['Bank'],
  CARD_TO_CARD: ['Bank', 'EMI'],
  WALLET_TO_WALLET: ['EMI'],
}

export const DEFAULT_EXTERNAL_CARD_COLOR = '#0fb36c'

const BIN_LENGTH = 6

const normalizeDigits = (value) => String(value ?? '').replace(/\D/g, '').trim()
const normalizeText = (value) => String(value ?? '').trim().toLowerCase()
const isValidHexColor = (value) => /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value ?? '').trim())

const normalizeCardNumber = (cardNumber) => normalizeDigits(cardNumber)

const normalizeBinValue = (value) => normalizeDigits(value).slice(0, BIN_LENGTH)

const extractBin = (cardNumber) => normalizeCardNumber(cardNumber).substring(0, BIN_LENGTH)

const getAllowedInstTypes = (transactionType) => {
  const allowedTypes = BIN_VALIDATION_RULES[transactionType]
  return Array.isArray(allowedTypes) ? allowedTypes : []
}

const fetchExternalBinList = async () => {
  const result = await fetchWithBasicAuth(EXTERNAL_BIN_LIST)
  return Array.isArray(result) ? result : []
}

const getExactBinMatchesByValue = (binList, bin) =>
  (Array.isArray(binList) ? binList : []).filter((item) => {
    if (Number(item?.status) !== 1) {
      return false
    }

    const startBin = normalizeBinValue(item?.start_bin)
    const endBin = normalizeBinValue(item?.end_bin ?? item?.start_bin)

    // Exact-match only: accept the BIN only when the active row itself is a single
    // 6-digit BIN entry, not when the BIN merely falls inside a range.
    return (
      startBin.length === BIN_LENGTH &&
      endBin.length === BIN_LENGTH &&
      startBin === bin &&
      endBin === bin
    )
  })

const pickPreferredBinMatch = (matches, card = {}) => {
  if (!Array.isArray(matches) || !matches.length) {
    return null
  }

  const preferredExternalName = normalizeText(card?.external_inst_name)
  const preferredShortName = normalizeText(card?.inst_short_name)
  const preferredInstType = normalizeText(card?.inst_type)

  return (
    matches.find((item) => normalizeText(item?.external_inst_name) === preferredExternalName) ||
    matches.find((item) => normalizeText(item?.inst_short_name) === preferredShortName) ||
    matches.find((item) => normalizeText(item?.inst_type) === preferredInstType) ||
    matches[0]
  )
}

export const resolveCardColorCode = (colorCode, fallback = DEFAULT_EXTERNAL_CARD_COLOR) => {
  if (isValidHexColor(colorCode)) {
    return String(colorCode).trim()
  }

  return fallback
}

export const getExactBinMatch = (binList, cardNumber, card = {}) => {
  const bin = extractBin(cardNumber)
  if (bin.length !== BIN_LENGTH) {
    return null
  }

  return pickPreferredBinMatch(getExactBinMatchesByValue(binList, bin), card)
}

export const isExactBinMatch = (binList, cardNumber) => Boolean(getExactBinMatch(binList, cardNumber))

export const isBinAllowedForTransaction = (matchedBin, transactionType) => {
  if (!matchedBin) return false

  const allowedTypes = getAllowedInstTypes(transactionType)
  if (!allowedTypes.length) return false

  const instType = String(matchedBin?.inst_type || '').trim()
  return allowedTypes.includes(instType)
}

export const lookupCardBin = async (cardNumber) => {
  const binList = await fetchExternalBinList()
  return getExactBinMatch(binList, cardNumber)
}

export const enrichCardWithBinMetadata = (card, binList) => {
  if (!card || typeof card !== 'object') {
    return card
  }

  const matchedBin = getExactBinMatch(binList, card.card_number || card.masked_card || '', card)
  if (!matchedBin) {
    return {
      ...card,
      color_code: resolveCardColorCode(card.color_code),
    }
  }

  return {
    ...card,
    external_inst_name: card.external_inst_name || matchedBin.external_inst_name,
    inst_short_name: card.inst_short_name || matchedBin.inst_short_name,
    inst_type: card.inst_type || matchedBin.inst_type,
    color_code: resolveCardColorCode(matchedBin.color_code, resolveCardColorCode(card.color_code)),
    bank_logo: card.bank_logo || matchedBin.bank_logo || null,
  }
}

export const enrichCardsWithBinMetadata = async (cards) => {
  const binList = await fetchExternalBinList()
  return (Array.isArray(cards) ? cards : []).map((card) => enrichCardWithBinMetadata(card, binList))
}

export const validateExactBin = async (cardNumber) => {
  const binList = await fetchExternalBinList()
  return isExactBinMatch(binList, cardNumber)
}

export const validateCardBinForTransaction = async (cardNumber, transactionType) => {
  const allowedTypes = getAllowedInstTypes(transactionType)
  if (!allowedTypes.length) {
    return null
  }

  const matchedBin = await lookupCardBin(cardNumber)

  if (!matchedBin) {
    throw new Error('BIN not supported')
  }

  if (!isBinAllowedForTransaction(matchedBin, transactionType)) {
    throw new Error('This card is not allowed for this transaction')
  }

  return matchedBin
}

export const validateTransactionCards = async ({
  transactionType,
  sourceCard,
  destinationCard,
}) => {
  if (transactionType === 'CARD_TO_CARD') {
    await validateCardBinForTransaction(sourceCard, transactionType)
    await validateCardBinForTransaction(destinationCard, transactionType)
    return
  }

  if (transactionType === 'CASH_IN') {
    await validateCardBinForTransaction(sourceCard, transactionType)
    return
  }

  if (transactionType === 'CASH_OUT' || transactionType === 'WALLET_TO_WALLET') {
    await validateCardBinForTransaction(destinationCard, transactionType)
  }
}
