import React, { useState } from "react";
import { Skeleton, Input, Tag } from "antd";
import { useFetcher, ShowDecodeError } from "@acco/decode";
import useSWR from "swr";
import { SearchOutlined } from "@ant-design/icons";
import "./VolunteerSearch.css";
import useFullObjectSearch from "./useFullObjectSearch";

export default function VolunteerSearch({ onSelect }) {
  let fetcher = useFetcher((data) => data.records);
  let { data: volunteers, error } = useSWR("listVolunteers", fetcher);

  let [filter, setFilter] = useState("");
  let fields = volunteers.map((r) => r.fields) || [];
  let filterResults = useFullObjectSearch(filter, fields);

  if (!volunteers) {
    return <Skeleton active />;
  }
  if (error) {
    return <ShowDecodeError error={error} />;
  }

  let rows;
  if (filter.length > 0) {
    rows = filterResults.indexes.map((idx) => volunteers[idx]);
  } else {
    rows = volunteers;
  }

  return (
    <div className="volunteer-search">
      <div className="search-bar">
        <Input
          autoFocus
          placeholder="Find a volunteer"
          prefix={<SearchOutlined />}
          value={filter}
          onChange={({ currentTarget: { value } }) => setFilter(value)}
        />
      </div>
      <div className="list">
        {rows.map(({ id, fields }) => (
          <div onClick={() => onSelect(id)} key={id} className="item">
            <div className="name">{fields["Name"]}</div>
            <div className="info">
              <span className="label">Zip code</span>
              <span className="value">{fields["Zip Code"]}</span>
              <span className="label"># of seniors</span>
              <span className="value">{fields["Number of Seniors"]}</span>
              <span className="label">Status</span>
              <span className="value">
                <Tag color="green">Available</Tag>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
