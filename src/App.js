import React, { useState, useEffect } from "react";
import { ShowDecodeError, ShowDecodeLoading, useFetcher } from "@acco/decode";
import useSWR, { mutate } from "swr";
import { Button, Modal } from "antd";
import "./App.css";
import StatusDropdown from "./StatusDropdown";
import VolunteerSearch from "./VolunteerSearch";
import Conversation from "./Conversation";
import { updateArray } from "./util";

export default function App() {
  let fetcher = useFetcher((data) => data.records);
  let { data: jobs, error: jobError } = useSWR("listJobs", fetcher);
  let { data: volunteers, error: volunteerError } = useSWR(
    "listVolunteers",
    fetcher
  );
  let [volunteerPickerJobId, setVolunteerPickerJobId] = useState();
  let [conversationModal, setConversationModal] = useState();

  let isLoading = !jobs || !volunteers;
  if (isLoading) {
    return <ShowDecodeLoading />;
  }
  let error = jobError || volunteerError;
  if (error) {
    return <ShowDecodeError error={error} />;
  }

  let mutateJob = (id, data) => {
    let idx = jobs.findIndex((job) => job.id === id);
    let job = jobs[idx];
    let update = updateArray(
      jobs,
      { ...job, fields: { ...job.fields, ...data.fields } },
      idx
    );
    mutate("listJobs", update, false);
  };

  let handleStatusChange = (id, value) => {
    let patch = { fields: { Status: value } };
    mutateJob(id, patch);
    fetcher("patchJob", {
      id,
      body: patch,
    });
  };

  let handleVolunteerSelect = async (volunteerId) => {
    let id = volunteerPickerJobId;
    let patch = { fields: { Volunteers: [volunteerId] } };
    mutateJob(id, patch);
    setVolunteerPickerJobId();
    fetcher("patchJob", {
      id,
      body: patch,
    });
  };

  let getJobPhoneNumber = (jobId) => {
    let job = jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error("`getJobSlug` was provided an invalid `jobId`");
    }
    return job.fields["Phone Number"];
  };

  return (
    <div>
      <Modal
        footer={null}
        onCancel={() => setVolunteerPickerJobId()}
        visible={volunteerPickerJobId}
        bodyStyle={{ borderRadius: "20px" }}
      >
        <VolunteerSearch onSelect={handleVolunteerSelect} />
      </Modal>
      <Modal
        footer={null}
        onCancel={() => setConversationModal()}
        visible={conversationModal}
        bodyStyle={{ borderRadius: "20px" }}
      >
        {conversationModal && (
          <Conversation
            jobId={conversationModal}
            jobNumber={getJobPhoneNumber(conversationModal)}
          />
        )}
      </Modal>
      {jobs.map((job, idx) => {
        let { id } = job;
        let { Volunteers: volunteerIds } = job.fields;
        let vols =
          volunteerIds?.map(
            (id) => volunteers.find((v) => v.id === id)?.fields["Name"]
          ) || [];
        return (
          <ShowJob
            key={idx}
            onStatusChange={(value) => handleStatusChange(id, value)}
            onVolunteerSet={() => setVolunteerPickerJobId(id)}
            onTextClick={() => setConversationModal(id)}
            fields={job.fields}
            volunteers={vols}
          />
        );
      })}
    </div>
  );
}

let ShowJob = ({
  fields,
  onStatusChange,
  onVolunteerSet,
  volunteers,
  onTextClick,
}) => {
  let { "Request Type": type } = fields;
  return (
    <div className="job">
      <div className="job-body">
        <div className="header">
          <b>{fields["Phone Number"]}</b> - {fields["Zip"]}
        </div>
        <div className="content">
          <div className="info-grid">
            <div style={{ gridColumn: "1 / span 2" }}>{type}</div>
            <div className="paired-neighbor">
              <div className="field-name">Volunteer</div>
              <div style={{ alignItems: "center" }}>
                {volunteers.length > 0 ? volunteers.join(", ") : "(None)"}
              </div>
              <div>
                {volunteers.length > 0 ? (
                  <div>
                    <Button
                      style={{ marginRight: "10px" }}
                      onClick={onVolunteerSet}
                      size="small"
                    >
                      Change
                    </Button>

                    <Button
                      style={{ gridColumn: 2 }}
                      onClick={onTextClick}
                      size="small"
                    >
                      Text
                    </Button>
                  </div>
                ) : (
                  <Button onClick={onVolunteerSet} size="small">
                    Set
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="info-grid">
            <div className="field-name">Status</div>
            <StatusDropdown onChange={onStatusChange} name={fields["Status"]} />
            <div className="field-name">Created</div>
            <div className="field-value">{fields["Date Created"]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
