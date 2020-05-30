import React, { useMemo, useState } from "react";
import { Skeleton, Comment, List, Form, Button, Input, Divider } from "antd";
import { ShowDecodeError, useFetcher } from "@acco/decode";
import useSWR from "swr";
import TextArea from "antd/lib/input/TextArea";

let { useForm } = Form;

export default function Conversation({ jobNumber, jobId }) {
  let [textIsSending, setTextIsSending] = useState(false);
  let fetcher = useFetcher((data) => data.records);
  let params = useMemo(() => {
    return {
      filterByFormula: `{Job Number}="${jobNumber}"`,
      sort: [{ field: "Created At" }, { direction: "asc" }],
    };
  }, [jobNumber]);

  let { data: conversations, error, mutate } = useSWR(
    ["listJobConversations", params],
    fetcher
  );
  let [form] = useForm();

  if (!conversations) {
    return <Skeleton active />;
  }
  if (error) {
    return <ShowDecodeError error={error} />;
  }

  let handleSubmit = async ({ message, to }) => {
    setTextIsSending(true);

    let newText = {
      fields: {
        With: to,
        Direction: "Outbound",
        Message: message,
        Job: [jobId],
      },
    };
    mutate(conversations.concat(newText), false);
    form.resetFields();
    await sendSms(message, to);
    await fetcher("createText", { body: newText });
    setTextIsSending(false);
  };

  let sendSms = async (message, to) => {
    let params = {
      from: "14322946752",
      to: [`+1${to}`],
      type: "mt_text",
      body: message,
    };
    await fetcher("sendSMS", { body: params });
  };

  return (
    <div>
      <List
        className="comment-list"
        header={`${conversations.length} messages`}
        itemLayout="horizontal"
        dataSource={conversations}
        renderItem={({ fields }) => {
          return (
            <li>
              <Comment
                author={fields["With"]}
                content={fields["Message"]}
                datetime={fields["Created At"]}
              />
            </li>
          );
        }}
      />
      <Divider>Send:</Divider>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="message" required>
          <TextArea />
        </Form.Item>
        <Form.Item
          name="to"
          normalize={(value) => value.replace(/[^\d]/g, "")}
          rules={[
            { required: true, message: "Please input your phone number" },
            {
              min: 10,
              message: "Phone number must be 10 digits without country code",
            },
          ]}
        >
          <Input
            addonBefore={"+1"}
            placeholder="(will send a real text! Enter your #)"
          />
        </Form.Item>
        <Button loading={textIsSending} type="primary" htmlType="submit">
          Send
        </Button>
      </Form>
    </div>
  );
}
