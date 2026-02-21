import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PageContainer from "../../../Reusable/PageContainer";
import Button from "../../../Reusable/Button";
import { formatTableDateTime } from "../../../utils/formatDate";
import THEME_COLORS from "../../../theme/colors";

const KeyValueRow = ({ label, value }) => (
  <div className="grid grid-cols-[minmax(140px,auto)_1fr] gap-4 items-center py-3 border-b border-gray-200 last:border-0 min-w-0">
    <span className="text-sm text-gray-600 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right break-words min-w-0">
      {value ?? "—"}
    </span>
  </div>
);

const CardBeneficiaryView = () => {
  const navigate = useNavigate();
  const contentCard = THEME_COLORS.contentCard;
  const { id } = useParams();
  const location = useLocation();
  const row = location.state?.row ?? null;

  if (!id || !row) {
    return (
      <PageContainer>
        <div className="px-4 py-6 min-h-full">
          <p style={{ color: contentCard.subtitle }}>No data available</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/customer/other-cards")}>
            Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const formatDate = (d) => formatTableDateTime(d);
  const displayData = [
    { label: "Masked card", value: row.masked_card },
    { label: "Cardholder name", value: row.cardholder_name },
    { label: "Nickname", value: row.cardholder_nick_name || "—" },
    { label: "Added on", value: formatDate(row.created_on) },
    { label: "Last modified", value: formatDate(row.last_modified_on) },
  ];

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold" style={{ color: contentCard.title }}>View Card Beneficiary</h2>
            <div className="flex gap-2 shrink-0">
              <Button type="button" size="sm" onClick={() => navigate(`/customer/other-cards/edit/${id}`, { state: { row } })}>
                Edit
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/customer/other-cards")}>
                Back
              </Button>
            </div>
          </div>
          <div
            className="w-full rounded-lg shadow-sm p-6 overflow-hidden"
            style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
          >
            <div className="min-w-0">
              {displayData.map(({ label, value }) => (
                <KeyValueRow key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CardBeneficiaryView;
