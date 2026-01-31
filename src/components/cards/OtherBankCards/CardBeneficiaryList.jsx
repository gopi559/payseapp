import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { HiCreditCard, HiEllipsisVertical } from "react-icons/hi2";
import PageContainer from "../../../Reusable/PageContainer";
import Button from "../../../Reusable/Button";
import DataTable from "../../../Reusable/Table";
import ActionPopover from "../../../Reusable/ActionPopover";
import { getAuthToken, deviceId } from "../../../services/api";
import { BENIFICIARY_LIST } from "../../../utils/constant";

const DEFAULT_PAGE_SIZE = 10;
const FETCH_PAGE_SIZE = 500; // Fetch all in one call; paginate in UI to avoid 404 on page 2

const CardBeneficiaryList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const userId = user?.reg_info?.user_id ?? user?.reg_info?.id ?? user?.user_id ?? user?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(BENIFICIARY_LIST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
         deviceInfo: JSON.stringify({
          device_type: "WEB",
          device_id: deviceId,
        }),
        },
        body: JSON.stringify({
          page: 1,
          no_of_data: FETCH_PAGE_SIZE,
          user_id: userId != null ? Number(userId) : undefined,
          is_temp: 0,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || "Failed to load beneficiaries");
      }
      if (result?.code !== 1) {
        throw new Error(result?.message || "Failed to load beneficiaries");
      }
      const list = Array.isArray(result?.data) ? result.data : [];
      setData(list);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load card beneficiaries");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize != null && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleView = (row) => {
    navigate(`/customer/other-cards/view/${row.id}`, { state: { row } });
  };

  const handleEdit = (row) => {
    navigate(`/customer/other-cards/edit/${row.id}`, { state: { row } });
  };

  const handleDelete = (row) => {
    navigate(`/customer/other-cards/delete/${row.id}`, { state: { row } });
  };

  const headers = [
    { key: "masked_card", label: "Masked card" },
    { key: "cardholder_name", label: "Cardholder name" },
    { key: "cardholder_nick_name", label: "Nickname" },
    { key: "created_on", label: "Added on" },
    {
      key: "actions",
      label: "Actions",
      content: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
            setSelectedRow(row);
          }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Actions"
        >
          <HiEllipsisVertical className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <PageContainer className="h-full">
      <div className="px-4 py-6 w-full h-full flex flex-col gap-4 min-h-0">
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <HiCreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Card Beneficiary List</h2>
              <p className="text-sm text-gray-500">Other bank cards saved as beneficiaries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate("/customer/other-cards/add")}>
              Add Beneficiary
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => navigate("/customer/cards")}>
              Back to Paysepe Card
            </Button>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-4 sm:p-6 overflow-visible">
          <DataTable
            data={data}
            headers={headers}
            loading={loading}
            searchPlaceholder="Search by card, name, nickname..."
            totalItems={data.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            pageSizeOptions={[10, 20, 50, 100]}
            totalRowsLabel="Total Rows: {count}"
            emptyMessage="No card beneficiaries yet."
            tableMaxHeight="280px"
          />
        </div>

        <ActionPopover
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          handleClose={handleClosePopover}
          selectedRow={selectedRow}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </PageContainer>
  );
};

export default CardBeneficiaryList;
