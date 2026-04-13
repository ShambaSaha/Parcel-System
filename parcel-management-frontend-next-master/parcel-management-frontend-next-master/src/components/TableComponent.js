import React from 'react';

const TableComponent = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  const groupedData = data.reduce((acc, obj) => {
    const { category } = obj;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(obj);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(groupedData).map(([category, items]) => (
        <div id={`category-${category}`} key={category}>
          <h4>{category}</h4>
          <div className="table-responsive my-2">
            <table className="table table-striped" >
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Path</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.name}>
                    <td scope="row">{i + 1}</td>
                    <td>{item.name}</td>
                    <td>
                      <a target="_blank" href={`${item.path}`}>{item.path}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableComponent;