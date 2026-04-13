import React from "react";

const AllParcelsTable = ({ allParcel = [], onToggleSelect }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Dimensions</th>
            <th>Weight</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {allParcel.map((parcel, index) => (
            <tr key={parcel._id}>
              <td>{index + 1}</td>

              <td>{parcel.name || "N/A"}</td>

              <td>
                {parcel.dimensions.length} ×{" "}
                {parcel.dimensions.breadth} ×{" "}
                {parcel.dimensions.height}
              </td>

              <td>{parcel.weight}</td>

              <td>
                <span
                  className={`badge ${
                    parcel.status === "selected"
                      ? "bg-success"
                      : "bg-secondary"
                  }`}
                >
                  {parcel.status === "selected"
                    ? "Selected"
                    : "Not Selected"}
                </span>
              </td>

              <td>
                <button
                  className={`btn btn-sm ${
                    parcel.status === "selected"
                      ? "btn-danger"
                      : "btn-primary"
                  }`}
                  onClick={() => onToggleSelect(parcel._id)}
                >
                  {parcel.status === "selected"
                    ? "Deselect"
                    : "Select"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllParcelsTable;