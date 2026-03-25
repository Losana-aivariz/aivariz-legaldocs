import React from "react";

const Drafts = () => {
  return (
    <div className="page-container">
      <div className="card">
        <h2>Submitted Drafts</h2>

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Draft</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>User 1</td>
              <td>Sample draft text...</td>
              <td><span className="tag pending">Pending</span></td>
              <td><button>Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drafts;
