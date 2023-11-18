import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSprintByIdThunk,
  updateTaskThunk,
} from "../../../../app/features/SprintPlanning/AsyncThunks";
import Style from "./EditViewTask.module.css";
import { isFulfilled } from "@reduxjs/toolkit";
import { Comments } from "../TaskForm/Comments";
import { ToolTip } from "../../../../components/Tooltip";
import infoIcon from "../../../../assets/info.svg";
import { DescriptionField } from "../../../../components/DescriptionField";
import { useSearchParams } from "react-router-dom";
import { ExportTaskModal } from "./ExportTaskModal";
import EditorJS from "../../../../components/EditorJS";
import EditorJSOutput from "../../../../components/EditorJSOutput";

const TABS = {
  DOCUMENTS: "DOCUMENTS",
  TASK: "TASK",
};

export const EditViewTaskModal = (props) => {
  const { showModal, setShowModal, existingTask, page } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskFormInput, setTaskFormInput] = useState({
    name: "",
    description: "",
    owner: "",
    ownerEmail: "",
    assignee: "",
    assigneeEmail: "",
    startDate: "",
    endDate: "",
    type: "",
    priority: "",
    status: "",
    estimatedEffort: "",
    worklog: {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    },
  });
  const [taskTab, setTaskTab] = useState("TASK");

  const [editMode, setEditMode] = useState(false);

  const editorInstance = useRef(null);
  const [editorData, setEditorData] = useState({});

  const saveDocEditor = async () => {
    if (!editorInstance.current) return {};
    let _doc = await editorInstance.current.save();
    setEditorData(_doc);
    return _doc;
  };

  const setEditorInstance = (core) => {
    editorInstance.current = core;
  };

  const [taskFormError, setTaskFormError] = useState({
    name: false,
    description: false,
    owner: false,
    ownerEmail: false,
    assigneeEmail: false,
    startDate: false,
    endDate: false,
    type: false,
    priority: false,
    status: false,
    estimatedEffort: false,
  });

  const dispatch = useDispatch();
  const { currentMilestoneData, currentSprintData, actionStatus, sprintUsers } =
    useSelector((state) => state.sprintPlanning);

  const [showExportModal, setShowExportModal] = useState(false);

  const getTaskComments = () => {
    if (currentMilestoneData) {
      const res = currentMilestoneData.tasks.find(
        (task) => task._id === searchParams.get("taskId")
      );
      return res ? res.comments : [];
    }
    return [];
  };

  useEffect(() => {
    if (existingTask?._id) {
      setSearchParams((searchParams) => {
        searchParams.set("taskId", existingTask._id);
        return searchParams;
      });
    }
  }, []);

  const taskTextInputChangeHandler = (evt, field) => {
    setTaskFormInput((prev) => ({
      ...prev,
      [field]: evt.target.value,
    }));
    if (evt.target.value.length === 0) {
      setTaskFormError((prev) => ({
        ...prev,
        [field]: true,
      }));
    } else {
      setTaskFormError((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const validateForm = () => {
    const _taskFormInput = JSON.parse(JSON.stringify(taskFormInput));
    delete _taskFormInput.worklog;
    return Object.keys(_taskFormInput).reduce((acc, curr) => {
      if (taskFormError[curr] !== undefined) {
        return acc || taskFormError[curr];
      } else {
        return true;
      }
    }, false);
  };

  const updateTaskHandler = async (evt) => {
    if (validateForm()) {
      evt.preventDefault();
    } else {
      let _doc = editorData;
      if (editorInstance.current) _doc = await editorInstance.current.save();

      const taskBody = { ...taskFormInput, document: _doc };
      delete taskBody.effortSpent;

      // delete the effortSpent property if its being sent

      const action = await dispatch(
        updateTaskThunk({
          sprintId: currentSprintData._id,
          milestoneId: currentMilestoneData._id,
          taskId: existingTask._id,
          taskBody,
        })
      );
      if (isFulfilled(action)) {
        setShowModal(false);
        dispatch(getSprintByIdThunk({ sprintId: currentSprintData._id }));
      }
    }
    if (searchParams.has("taskId")) searchParams.delete("taskId");
  };

  useEffect(() => {
    if (existingTask) {
      const {
        name,
        description,
        owner,
        ownerEmail,
        assignee,
        assigneeEmail,
        startDate,
        endDate,
        type,
        priority,
        status,
        estimatedEffort,
        effortSpent,
        worklog,
        document,
      } = existingTask;

      setTaskFormInput({
        name,
        description,
        owner,
        ownerEmail,
        assignee,
        assigneeEmail,
        startDate,
        endDate,
        type,
        priority,
        status,
        estimatedEffort,
        effortSpent,
        worklog,
      });
      setEditorData(document || {});

      setTaskFormError({
        name: false,
        description: false,
        owner: false,
        ownerEmail: false,
        assignee: false,
        assigneeEmail: false,
        startDate: false,
        endDate: false,
        type: false,
        priority: false,
        status: false,
        estimatedEffort: false,
        effortSpent: false,
      });
      setEditMode(false);
    }
  }, [existingTask]);

  const getTotalEffort = (worklog) => {
    return Object.keys(worklog).reduce((acc, curr) => acc + worklog[curr], 0);
  };

  useEffect(() => {
    return () => {
      if (searchParams.has("taskId")) {
        searchParams.delete("taskId");
        setSearchParams(searchParams);
      }
    };
  }, []);

  const checkForUnsavedChanges = () => {
    if (existingTask) {
      const existingTaskDuplicate = { ...existingTask };
      delete existingTaskDuplicate._id;
      delete existingTaskDuplicate.comments;
      delete existingTaskDuplicate.mts;
      delete existingTaskDuplicate.cts;
      delete existingTaskDuplicate.releaseInfo;
      delete existingTaskDuplicate.__v;
      delete existingTaskDuplicate.document;
      return true;
    }
  };

  const switchTab = async (tab) => {
    let prevTab = taskTab;
    setTaskTab(tab);

    if (prevTab === TABS.DOCUMENTS && tab !== TABS.DOCUMENTS) {
      saveDocEditor();
    }
  };

  return (
    <>
      {showExportModal && (
        <ExportTaskModal show={showExportModal} setShow={setShowExportModal} setShowTaskModal={setShowModal} />
      )}

      <div
        className={`${Style["task__container"]} ${showModal && Style["show"]}`}
        onClick={(evt) => {
          evt.stopPropagation();
          if (checkForUnsavedChanges()) {
            setShowModal(false);
          }
        }}
      >
        <div
          className={Style["task-modal__container"]}
          onClick={(evt) => {
            evt.stopPropagation();
          }}
        >
          <div className={`${Style["tasks-tabs__container"]}`}>
            <div
              className={`${Style["task-tab"]} ${
                taskTab === "TASK" ? Style["active"] : ""
              }`}
              onClick={() => {
                switchTab("TASK");
              }}
            >
              {editMode ? "Update Task details" : "View Task details"}
            </div>
            <div
              className={`${Style["task-tab"]} ${
                taskTab === "DOCUMENTS" ? Style["active"] : ""
              }`}
              onClick={() => {
                switchTab("DOCUMENTS");
              }}
            >
              Documents
            </div>
          </div>

          <div className={Style["editmode-btn__container"]}>
            <button
              className={`${Style["btn"]} ${Style["btn-secondary"]}`}
              onClick={() => {
                setShowExportModal(true);
              }}
            >
              Move Task
            </button>

            {editMode ? (
              <button
                className={`${Style["btn"]} ${Style["btn-secondary"]}`}
                onClick={() => {
                  setEditMode(false);
                }}
              >
                View
              </button>
            ) : (
              <button
                className={`${Style["btn"]} ${Style["btn-primary"]}`}
                onClick={() => {
                  console.log(editMode, "im clicked");

                  setEditMode(true);
                }}
              >
                Edit
              </button>
            )}
          </div>

          {/* Task Details Form  */}
          {taskTab === "TASK" && (
            <div className={Style["task-modal-input__container"]}>
              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Name {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <input
                    placeholder="Enter Task Name"
                    className={`${Style["modal-input"]} ${
                      taskFormError.name && Style["modal-input-error"]
                    }`}
                    type="text"
                    value={taskFormInput.name}
                    disabled
                   
                  />
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.name}
                  </p>
                )}
              </div>

              <DescriptionField
                editMode={editMode}
                isEditModeProp={true}
                descriptionInput={taskFormInput.description}
                descriptionError={taskFormError.description}
                InputChangeHandler={taskTextInputChangeHandler}
              />

              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Owner {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <input
                    placeholder="Enter Owner Name"
                    className={`${Style["modal-input"]} ${
                      taskFormError.owner && Style["modal-input-error"]
                    }`}
                    type="text"
                    value={taskFormInput.owner}
                    disabled
                  />
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.owner}
                  </p>
                )}
              </div>
              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Owner Email {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <input
                    placeholder="Enter Owner Email"
                    className={`${Style["modal-input"]} ${
                      taskFormError.ownerEmail && Style["modal-input-error"]
                    }`}
                    type="email"
                    value={taskFormInput.ownerEmail}
                    disabled
                  />
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.ownerEmail}
                  </p>
                )}
              </div>
              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Assignee {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <select
                    name="assignee"
                    id="assignee"
                    className={Style["modal-input"]}
                    value={taskFormInput.assignee}
                    onChange={(evt) => {
                      const assigneeName = evt.target.value;
                      const assigneeEmail = sprintUsers.find(
                        (user) => user.name === assigneeName
                      )?.email;
                      setTaskFormInput((prev) => ({
                        ...prev,
                        assignee: evt.target.value,
                        assigneeEmail,
                      }));

                      if (evt.target.value.length === 0) {
                        setTaskFormError((prev) => ({
                          ...prev,
                          assignee: true,
                        }));
                      } else {
                        setTaskFormError((prev) => ({
                          ...prev,
                          assignee: false,
                          assigneeEmail: false,
                        }));
                      }
                    }}
                  >
                    <option value={""} selected disabled>
                      Select a Assignee
                    </option>
                    {sprintUsers?.map((user) => (
                      <option value={user.name} key={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.assignee}
                  </p>
                )}
              </div>
              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Assignee Email {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <select
                    name="assigneeEmail"
                    id="assigneeEmail"
                    className={Style["modal-input"]}
                    value={taskFormInput.assigneeEmail}
                    onChange={(evt) => {
                      setTaskFormInput((prev) => ({
                        ...prev,
                        assigneeEmail: evt.target.value,
                      }));

                      if (evt.target.value.length === 0) {
                        setTaskFormError((prev) => ({
                          ...prev,
                          assigneeEmail: true,
                        }));
                      } else {
                        setTaskFormError((prev) => ({
                          ...prev,
                          assigneeEmail: false,
                        }));
                      }
                    }}
                  >
                    <option value={""} selected disabled>
                      Select a Assignee Email
                    </option>
                    {sprintUsers?.map((user) => (
                      <option value={user.email} key={user._id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.assigneeEmail}
                  </p>
                )}
              </div>
              <div
                className={`${Style["input-group__container"]} d-flex flex-row`}
              >
                <div className={Style["modal-date-input__container"]}>
                  <label className={Style["modal-input-label"]}>
                    Start Date {editMode && <span>*</span>}
                  </label>
                  {editMode ? (
                    <input
                      type={"date"}
                      className={`${Style["modal-date-input"]} ${
                        taskFormError.startDate && Style["modal-input-error"]
                      }`}
                      value={taskFormInput.startDate}
                      onChange={(evt) => {
                        setTaskFormInput((prev) => ({
                          ...prev,
                          startDate: evt.target.value,
                        }));
                        if (evt.target.value.length === 0) {
                          setTaskFormError((prev) => ({
                            ...prev,
                            startDate: true,
                          }));
                        } else {
                          setTaskFormError((prev) => ({
                            ...prev,
                            startDate: false,
                          }));
                        }
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.startDate}
                    </p>
                  )}
                </div>
                <div className={Style["modal-date-input__container"]}>
                  <label className={Style["modal-input-label"]}>
                    End Date {editMode && <span>*</span>}
                  </label>
                  {editMode ? (
                    <input
                      type={"date"}
                      className={`${Style["modal-date-input"]} ${
                        taskFormError.endDate && Style["modal-input-error"]
                      }`}
                      value={taskFormInput.endDate}
                      onChange={(evt) => {
                        setTaskFormInput((prev) => ({
                          ...prev,
                          endDate: evt.target.value,
                        }));
                        if (evt.target.value.length === 0) {
                          setTaskFormError((prev) => ({
                            ...prev,
                            endDate: true,
                          }));
                        } else {
                          setTaskFormError((prev) => ({
                            ...prev,
                            endDate: false,
                          }));
                        }
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.endDate}
                    </p>
                  )}
                </div>
              </div>
              <div className={`${Style["input-group__container"]}`}>
                <label className={Style["modal-input-label"]} for="type">
                  Type {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <select
                    name="type"
                    id="type"
                    className={Style["modal-input"]}
                    value={taskFormInput.type}
                    onChange={(evt) => {
                      setTaskFormInput((prev) => ({
                        ...prev,
                        type: evt.target.value,
                      }));

                      if (evt.target.value.length === 0) {
                        setTaskFormError((prev) => ({
                          ...prev,
                          type: true,
                        }));
                      } else {
                        setTaskFormError((prev) => ({
                          ...prev,
                          type: false,
                        }));
                      }
                    }}
                  >
                    <option value={""} selected disabled>
                      Select a Type
                    </option>
                    <option value="DESIGN">Design</option>
                    <option value="BACKEND">Backend</option>
                    <option value="FRONTEND">Frontend</option>
                    <option value="QA">QA</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="CONFIGURATION">Configuration</option>
                    <option value="MISCELLANEOUS">Miscellaneous</option>
                  </select>
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.type}
                  </p>
                )}
              </div>
              <div className={`${Style["input-group__container"]}`}>
                <label className={Style["modal-input-label"]} for="type">
                  Priority {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <select
                    name="priority"
                    id="priority"
                    className={Style["modal-input"]}
                    value={taskFormInput.priority}
                    onChange={(evt) => {
                      setTaskFormInput((prev) => ({
                        ...prev,
                        priority: evt.target.value,
                      }));

                      if (evt.target.value.length === 0) {
                        setTaskFormError((prev) => ({
                          ...prev,
                          priority: true,
                        }));
                      } else {
                        setTaskFormError((prev) => ({
                          ...prev,
                          priority: false,
                        }));
                      }
                    }}
                  >
                    <option value={""} selected disabled>
                      Select a Priority
                    </option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.priority}
                  </p>
                )}
              </div>
              <div className={`${Style["input-group__container"]}`}>
                <label className={Style["modal-input-label"]} for="type">
                  Status {editMode && <span>*</span>}
                </label>
                {editMode ? (
                  <select
                    name="status"
                    id="status"
                    className={Style["modal-input"]}
                    value={taskFormInput.status}
                    onChange={(evt) => {
                      setTaskFormInput((prev) => ({
                        ...prev,
                        status: evt.target.value,
                      }));

                      if (evt.target.value.length === 0) {
                        setTaskFormError((prev) => ({
                          ...prev,
                          status: true,
                        }));
                      } else {
                        setTaskFormError((prev) => ({
                          ...prev,
                          status: false,
                        }));
                      }
                    }}
                  >
                    <option value={""} selected disabled>
                      Select a Status
                    </option>
                    <option value="READY">Ready</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="CODE REVIEW">Code Review</option>
                    <option value="TESTING">Testing</option>
                    <option value="READY FOR RELEASE">
                      Ready for Realease
                    </option>
                    <option value="IN PROD">In Prod</option>
                    <option value="DONE">Done</option>
                    <option value="REJECT">Reject</option>
                  </select>
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.status}
                  </p>
                )}
              </div>
              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Estimated Effort {editMode && <span>*</span>}{" "}
                  <ToolTip name={"All Efforts are in hours"} align="right">
                    <span>
                      <img src={infoIcon} className="edit-icon" />
                    </span>
                  </ToolTip>
                </label>
                {editMode ? (
                  <input
                    placeholder="Enter Estimated Effort in hours"
                    className={`${Style["modal-input"]} ${
                      taskFormError.estimatedEffort &&
                      Style["modal-input-error"]
                    }`}
                    type="number"
                    min={0}
                    value={taskFormInput.estimatedEffort}
                    disabled
                    onChange={(evt) => {
                      setTaskFormInput((prev) => ({
                        ...prev,
                        estimatedEffort: Number(evt.target.value),
                      }));

                      if (Number(evt.target.value) < 0) {
                        setTaskFormError((prev) => ({
                          ...prev,
                          estimatedEffort: true,
                        }));
                      } else {
                        setTaskFormError((prev) => ({
                          ...prev,
                          estimatedEffort: false,
                        }));
                      }
                    }}
                  />
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.estimatedEffort}
                  </p>
                )}
              </div>
              <div className={Style["input-group__container"]}>
                <label className={Style["modal-input-label"]}>
                  Effort Spent{" "}
                  <ToolTip name={"All Efforts are in hours"} align="right">
                    <span>
                      <img src={infoIcon} className="edit-icon" />
                    </span>
                  </ToolTip>
                </label>
                {editMode ? (
                  <input
                    placeholder="Enter Effort in hours"
                    className={`${Style["modal-input"]}`}
                    type="number"
                    value={taskFormInput.effortSpent}
                    disabled
                  />
                ) : (
                  <p className={Style["modal-detail-text"]}>
                    {taskFormInput.effortSpent}
                  </p>
                )}
              </div>

              <div className={Style["input-group__container"]}>
                <label className={`${Style["modal-input-label"]} fs-6`}>
                  Worklog{" "}
                  <ToolTip name={"All Efforts are in hours"} align="right">
                    <span>
                      <img src={infoIcon} className="edit-icon" />
                    </span>
                  </ToolTip>
                </label>
              </div>

              <div
                className={`${Style["input-group__container"]} d-flex flex-row flex-wrap`}
              >
                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>Monday</label>

                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Monday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Monday: Number(evt.target.value),
                        };

                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Monday}
                    </p>
                  )}
                </div>

                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>Tuesday</label>
                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Tuesday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Tuesday: Number(evt.target.value),
                        };
                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Tuesday}
                    </p>
                  )}
                </div>

                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>
                    Wednesday
                  </label>

                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Wednesday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Wednesday: Number(evt.target.value),
                        };
                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Wednesday}
                    </p>
                  )}
                </div>

                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>Thursday</label>

                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Thursday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Thursday: Number(evt.target.value),
                        };
                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Thursday}
                    </p>
                  )}
                </div>

                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>Friday</label>

                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Friday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Friday: Number(evt.target.value),
                        };
                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Friday}
                    </p>
                  )}
                </div>

                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>Saturday</label>

                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Saturday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Saturday: Number(evt.target.value),
                        };
                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Saturday}
                    </p>
                  )}
                </div>

                <div
                  className={
                    !editMode
                      ? Style["modal-date-input__container"]
                      : Style["modal-edit-worklog"]
                  }
                >
                  <label className={Style["modal-input-label"]}>Sunday</label>

                  {editMode ? (
                    <input
                      placeholder="Enter Effort in hours"
                      className={Style["modal-date-input"]}
                      type="number"
                      min={0}
                      value={taskFormInput.worklog.Sunday}
                      onChange={(evt) => {
                        const updatedWorklog = {
                          ...taskFormInput.worklog,
                          Sunday: Number(evt.target.value),
                        };
                        setTaskFormInput((prev) => ({
                          ...prev,
                          worklog: updatedWorklog,
                          effortSpent: getTotalEffort(updatedWorklog),
                        }));
                      }}
                    />
                  ) : (
                    <p className={Style["modal-detail-text"]}>
                      {taskFormInput.worklog.Sunday}
                    </p>
                  )}
                </div>
              </div>
              {getTaskComments().length > 0 && <hr />}
              {(getTaskComments().length > 0 || editMode) && (
                <Comments editMode={editMode} />
              )}
              <hr />
            </div>
          )}


          {taskTab === "DOCUMENTS" && (
            <>
              <div
                className="p-3 ps-5"
                style={{ height: "calc(100vh - 144px)", overflow: "auto" }}
              >
                {editMode ? (
                  <EditorJS
                    data={editorData}
                    setEditorInstance={setEditorInstance}
                  />
                ) : (
                  <EditorJSOutput data={editorData} />
                )}
              </div>
            </>
          )}

          <div className={Style["task-modal-action-btn__container"]}>
            <button
              className={`${Style["btn"]} ${Style["btn-secondary"]}`}
              onClick={() => {
                if (checkForUnsavedChanges()) {
                  setShowModal(false);
                }
              }}
            >
              Cancel
            </button>
            {editMode && (
              <button
                className={`${Style["btn"]} ${Style["btn-primary"]}`}
                disabled={validateForm()}
                onClick={updateTaskHandler}
              >
                {actionStatus.updateTask === "loading"
                  ? "Updating..."
                  : "Update"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
