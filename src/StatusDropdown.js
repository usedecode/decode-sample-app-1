import React from "react";
import { Select, Tag } from "antd";

const JOB_STATUSES = [
  ["new", "New"],
  ["firstVm", "Left 1st Voicemail"],
  ["secondVm", "Left 2nd Voicemail"],
  ["followup", "Follow-up Later"],
  ["awaitingVol", "Awaiting Volunteer"],
  ["volunteerConf", "Volunteer Confirmed Contact"],
  ["done", "Job Done"],
  ["other", "Other (See Notes)"],
];

let getStatusName = (value) => {
  let res = JOB_STATUSES.find(([v, _n]) => v === value);
  if (!res) {
    throw new Error(`Unexpected status value received: ${value}`);
  }
  let [_value, name] = res;
  return name;
};
let getStatusValue = (name) => {
  let res = JOB_STATUSES.find(([_v, n]) => n === name);
  if (!res) {
    throw new Error(`Unexpected status name received: ${name}`);
  }
  let [value, _name] = res;
  return value;
};

const { Option } = Select;

export default function StatusDropdown({ name, onChange }) {
  let value = getStatusValue(name);
  let handleChange = (value) => {
    let name = getStatusName(value);
    onChange(name);
  };
  return (
    <div className="status">
      <Select
        bordered={false}
        defaultValue={value}
        onChange={handleChange}
        style={{ width: 180 }}
      >
        <Option value="new">
          <Tag color="#F9D77E">New</Tag>
        </Option>
        <Option value="firstVm">
          <Tag color="#FFE2D5">Left 1st Voicemail</Tag>
        </Option>
        <Option value="secondVm">
          <Tag color="#FF9EB7">Left 2nd Voicemail</Tag>
        </Option>
        <Option value="followup">
          <Tag color="#FF6F2C">{`Follow-up Later (<1w)`}</Tag>
        </Option>
        <Option value="awaitingVol">
          <Tag color="#CFDFFF">Awaiting Volunteer</Tag>
        </Option>
        <Option value="volConf">
          <Tag color="#21D2CC">Volunteer Confirmed Contact</Tag>
        </Option>
        <Option value="done">
          <Tag color="#22C932">Job Done</Tag>
        </Option>
        <Option value="other">
          <Tag color="#F82C60">Other (See Notes)</Tag>
        </Option>
      </Select>
    </div>
  );
}
