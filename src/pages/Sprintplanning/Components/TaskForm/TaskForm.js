import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createNewTaskThunk,
  getSprintByIdThunk,
} from "../../../../app/features/SprintPlanning/AsyncThunks";

import Style from "./TaskForm.module.css";
import { isFulfilled } from "@reduxjs/toolkit";
import { getLoggedInUser } from "../../../../utils";
import infoIcon from "../../../../assets/info.svg";
import { ToolTip } from "../../../../components/Tooltip";
import { DescriptionField } from "../../../../components/DescriptionField";
import { filterArrayByName } from "../../../../helpers";
import { toast } from "react-toastify";

export const TaskForm = (props) => {
  const { showModal, setShowModal } = props;
  const [taskFormInput, setTaskFormInput] = useState({
    name: "",
    description: "",
    owner: getLoggedInUser().name,
    ownerEmail: getLoggedInUser().email,
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
  const [togglePreviewNew, setTogglePreviewNew] = useState(false);
  const [rfcTemplate, setRfctemplate] = useState("");

  const [taskFormError, setTaskFormError] = useState({
    owner: false,
    ownerEmail: false,
  });

  const dispatch = useDispatch();
  const { currentMilestoneData, currentSprintData, actionStatus, sprintUsers } =
    useSelector((state) => state.sprintPlanning);

  const getInitialState = () => {
    return {
      name: "",
      description: "",
      owner: getLoggedInUser().name,
      ownerEmail: getLoggedInUser().email,
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
    };
  };

  useEffect(() => {
    setTaskFormInput(getInitialState());
    setRfctemplate("");
  }, [showModal]);

  // const [desc, setDesc] = useState("")

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

  const validateSourceControl = (sources) => {
    if (sources.length === 0) {
      return false;
    } else {
      return taskFormError.sourceControl.reduce(
        (acc, curr) =>
          acc ||
          ["repoName", "branchName", "link"].reduce((acc, currKey) => {
            if (curr[currKey] !== undefined) {
              return acc || curr[currKey];
            } else {
              return true;
            }
          }, false),
        false
      );
    }
  };

  const validatePipeline = (pipelines) => {
    if (pipelines.length === 0) {
      return false;
    } else {
      return taskFormError.pipeline.reduce((acc, curr) => {
        if (curr.buildUrl !== undefined) {
          return acc || curr.buildUrl;
        } else {
          return true;
        }
      }, false);
    }
  };

  const validateDependency = (dependencies) => {
    if (dependencies.length === 0) {
      return false;
    } else {
      return taskFormError.dependency.reduce((acc, curr) => {
        if (curr.link !== undefined) {
          return acc || curr.link;
        } else {
          return true;
        }
      }, false);
    }
  };

  const validateForm = () => {
    const _taskFormInput = JSON.parse(JSON.stringify(taskFormInput));
    delete _taskFormInput.worklog;
    return Object.keys(_taskFormInput).reduce((acc, curr) => {
      if (taskFormError[curr] !== undefined) {
        if (curr === "sourceControl") {
          return acc || validateSourceControl(taskFormInput.sourceControl);
        } else if (curr === "pipeline") {
          return acc || validatePipeline(taskFormInput.pipeline);
        } else if (curr === "dependency") {
          return acc || validateDependency(taskFormInput.dependency);
        }
        return acc || taskFormError[curr];
      } else {
        return true;
      }
    }, false);
  };

  const createTaskHandler = async (evt) => {
    if (validateForm()) {
      evt.preventDefault();
    } else {
      // call task create thunk
      const taskBody = { ...taskFormInput, rfcTemplate };

      let action = null;

      action = await dispatch(
        createNewTaskThunk({
          milestoneId: currentMilestoneData._id,
          sprintId: currentSprintData._id,
          taskBody,
        })
      );

      if (isFulfilled(action)) {
        setTaskFormInput(getInitialState());
        setTaskFormError({});
        setShowModal(false);
        dispatch(getSprintByIdThunk({ sprintId: currentSprintData._id }));
      }
    }
  };

  return (
    <div
      className={`${Style["task__container"]} ${showModal && Style["show"]}`}
      onClick={(evt) => {
        evt.stopPropagation();
        setShowModal(false);
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
              setTaskTab("TASK");
            }}
          >
            Task Details
          </div>
        </div>
        {/* Task Details Form  */}
        {taskTab === "TASK" && (
          <div className={Style["task-modal-input__container"]}>
            <div className={Style["input-group__container"]}>
              <label className={Style["modal-input-label"]}>
                Name <span>*</span>
              </label>
              <input
                placeholder="Enter Task Name"
                className={`${Style["modal-input"]} ${
                  taskFormError.name && Style["modal-input-error"]
                }`}
                type="text"
                value={taskFormInput.name}
                onChange={(evt) => taskTextInputChangeHandler(evt, "name")}
              />
            </div>
            <DescriptionField
              descriptionInput={taskFormInput.description}
              descriptionError={taskFormError.description}
              InputChangeHandler={taskTextInputChangeHandler}
            />

            <div className={Style["input-group__container"]}>
              <label className={Style["modal-input-label"]}>
                Owner <span>*</span>
              </label>
              <input
                placeholder="Enter Owner Name"
                className={`${Style["modal-input"]} ${
                  taskFormError.owner && Style["modal-input-error"]
                }`}
                type="text"
                value={taskFormInput.owner}
                disabled
              />
            </div>
            <div className={Style["input-group__container"]}>
              <label className={Style["modal-input-label"]}>
                Owner Email <span>*</span>
              </label>
              <input
                placeholder="Enter Owner Email"
                className={`${Style["modal-input"]} ${
                  taskFormError.ownerEmail && Style["modal-input-error"]
                }`}
                type="email"
                value={taskFormInput.ownerEmail}
                disabled
              />
            </div>
            <div className={Style["input-group__container"]}>
              <label className={Style["modal-input-label"]} for="assignee">
                Assignee <span>*</span>
              </label>
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
                {sprintUsers &&
                  filterArrayByName(sprintUsers)?.map((user) => (
                    <option value={user.name} key={user._id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className={Style["input-group__container"]}>
              <label className={Style["modal-input-label"]}>
                Assignee Email <span>*</span>
              </label>
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
                {sprintUsers &&
                  filterArrayByName(sprintUsers)?.map((user) => (
                    <option value={user.email} key={user._id}>
                      {user.email}
                    </option>
                  ))}
              </select>
            </div>
            <div
              className={`${Style["input-group__container"]} d-flex flex-row`}
            >
              <div className={Style["modal-date-input__container"]}>
                <label className={Style["modal-input-label"]}>
                  Start Date <span>*</span>
                </label>
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
              </div>
              <div className={Style["modal-date-input__container"]}>
                <label className={Style["modal-input-label"]}>
                  End Date <span>*</span>
                </label>
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
              </div>
            </div>
            <div className={`${Style["input-group__container"]}`}>
              <label className={Style["modal-input-label"]} for="type">
                Type <span>*</span>
              </label>
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
                <option value="BACKEND">Backend</option>
                <option value="CONFIGURATION">Configuration</option>
                <option value="DESIGN">Design</option>
                <option value="FRONTEND">Frontend</option>
                <option value="MISCELLANEOUS">Miscellaneous</option>
                <option value="OPERATIONS">Operations</option>{" "}
                <option value="QA">QA</option>
              </select>
            </div>
            <div className={`${Style["input-group__container"]}`}>
              <label className={Style["modal-input-label"]} for="type">
                Priority <span>*</span>
              </label>
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
            </div>
            <div className={`${Style["input-group__container"]}`}>
              <label className={Style["modal-input-label"]} for="type">
                Status <span>*</span>
              </label>
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
                <option value="READY FOR RELEASE">Ready for Realease</option>
                <option value="IN PROD">In Prod</option>
                <option value="DONE">Done</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
            <div className={Style["input-group__container"]}>
              <label className={Style["modal-input-label"]}>
                Estimated Effort <span>*</span>{" "}
                <ToolTip name={"All Efforts are in hours"} align="right">
                  <span>
                    <img src={infoIcon} className="edit-icon" />
                  </span>
                </ToolTip>
              </label>
              <input
                placeholder="Enter Estimated Effort in hours"
                className={`${Style["modal-input"]} ${
                  taskFormError.estimatedEffort && Style["modal-input-error"]
                }`}
                type="number"
                min={0}
                value={taskFormInput.estimatedEffort}
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
            </div>
          </div>
        )}

        {/* Start of action buttons  */}
        <div className={Style["task-modal-action-btn__container"]}>
          <button
            className={`${Style["btn"]} ${Style["btn-secondary"]}`}
            onClick={() => {
              setShowModal(false);
            }}
          >
            Cancel
          </button>
          <button
            className={`${Style["btn"]} ${Style["btn-primary"]}`}
            disabled={validateForm()}
            onClick={createTaskHandler}
          >
            {actionStatus.createNewTask === "loading"
              ? "Creating..."
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
