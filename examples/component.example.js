import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uId } from "uuid";
import classnames from "classnames";
import useFile from "../../hooks/useFile";
import useDebounce from "../../hooks/useDebounce";
import bytesToSize from "../../helpers/normalizeFilesSize";
import { parseDate } from "../../helpers/messagesHelper";
import { downloadMessages, seenMessageRequest } from "../../store/messages/messages.actions";
import UploadFiles from "../../components/UploadFiles";
import AddNewMessage from "../../components/ModalContent/AddNewMessage/AddNewMessage";
import { ModalContext } from "../../context/modalContext";
import LoaderBlock from "../../components/LoaderBlock/LoaderBlock";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Select from "../../components/Select/Select";
import Textarea from "../../components/Textarea";

import "./Messages.scss";

const Messages = React.memo(() => {
    const { onModalHandler } = React.useContext(ModalContext);
    const { isLoaded, updatingParams, messages, newMessage } = useSelector((state) => state.messages);
    const dispatch = useDispatch();

    const [messagesState, setMessagesState] = React.useState({
        messagesList: [],
        targetMessage: null
    });
    const [messageParams, setMessageParams] = React.useState({
        SearchStr: "",
        FromNwcc: "",
        DaysAgo: ""
    });

    const debounceValue = useDebounce(messageParams, 300);

    React.useEffect(() => {
        if (!messages) {
            dispatch(downloadMessages());
        } else {
            setMessagesState({
                messagesList: messages,
                targetMessage: messages[0]
            })
        }
    }, [messages, dispatch])

    React.useEffect(() => {
        dispatch(downloadMessages(debounceValue));
    }, [debounceValue, dispatch])

    React.useEffect(() => {
        const needToRead = messagesState.targetMessage && messagesState.targetMessage['NewMessage'];
        if (needToRead) {
            dispatch(seenMessageRequest(messagesState.targetMessage['MessageId']));
        }
    }, [messagesState.targetMessage, dispatch])

    const onOpenAddMessage = () => onModalHandler(<AddNewMessage newMessage={newMessage} />, 'md');

    const onChangeTargetMessage = (message) => () => setMessagesState((prev) => ({ ...prev, targetMessage: message }));

    const onChangeHandler = ({ target }) => {
        const { value, name } = target;
        setMessageParams((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const listClasses = classnames({
        "message__list-items": true,
        "message__list-items-load": updatingParams
    })

    const { messagesList, targetMessage } = messagesState;

    return !isLoaded ? <LoaderBlock className="main-loader" /> : (
        <div className="content-view message">
            <div className="message__list">
                <div className="message__list-search">
                    <Input className="search-input"
                        type="text"
                        name="SearchStr"
                        value={messageParams.SearchStr}
                        placeholder={"Search (by email, containing)"}
                        onChange={onChangeHandler}
                    />
                </div>
                <div className={listClasses}>
                    {messagesList.length > 0
                        ? <RenderMessagesList
                            messages={messagesList}
                            targetMessage={targetMessage}
                            onChangeTargetMessage={onChangeTargetMessage}
                        />
                        : <NoMessageInfo />
                    }
                </div>
            </div>
            <div className="message__view">
                <div className="message__view-controls">
                    <Button type="button" className="btn btn-dark btn-message"
                        onClick={onOpenAddMessage}>{"New Message"}</Button>
                    <Select
                        className="select select-message"
                        title={"Show All"}
                        list={[
                            { title: "Show All", targetName: "FromNwcc", value: "" },
                            { title: "Show from Nwcc", targetName: "FromNwcc", value: true },
                            { title: "Show to Nwcc", targetName: "FromNwcc", value: false }
                        ]}
                        onChangeCustom={onChangeHandler}
                    />
                    <Select
                        className="select select-message"
                        name={"DaysAgo"}
                        title={"Past days"}
                        list={[
                            { title: "Past days", targetName: "DaysAgo", value: "" },
                            { title: "Past 30 days", targetName: "DaysAgo", value: "30" },
                            { title: "Past 60 days", targetName: "DaysAgo", value: "60" },
                            { title: "Past 90 days", targetName: "DaysAgo", value: "90" }
                        ]}
                        onChangeCustom={onChangeHandler}
                    />
                    <Select
                        className="select select-message select-message__custom"
                        name={"newMessage"}
                        title={"Newest"}
                        list={[
                            { title: "Newest", targetName: "OrderBy", value: "dateDesc" },
                            { title: "Oldest", targetName: "OrderBy", value: "dateAsc" }
                        ]}
                        onChangeCustom={onChangeHandler}
                    />
                </div>
                {targetMessage && <RenderMessageHistory targetMessage={targetMessage} />}
            </div>
        </div>
    )
})

const NoMessageInfo = () => {
    return (
        <h1>{"No messages"}</h1>
    )
}

const RenderMessagesList = React.memo(({ messages, targetMessage, onChangeTargetMessage }) => (
    messages.length > 0 ? messages.map((message) => (
        <div
            key={message["MessageId"]}
            className={`message__list-item ${targetMessage["MessageId"] === message["MessageId"] ? "message__list-item-active" : ""}`}
            onClick={onChangeTargetMessage(message)}>
            <div className={`item-title ${message['NewMessage'] ? "item-title-unread" : ""}`}>{message["Subject"]}</div>
            <div className="item-data">
                <span className="item-data__title">{"From:"}</span>
                <span className="item-data__sub-title">{message["MessageFrom"]}</span>
            </div>
            <div className="item-data">
                <span className="item-data__title">{"To:"}</span>
                <span className="item-data__sub-title">{message["MessageTo"]}</span>
            </div>
            <div className="item-time">
                <div className="item-loan">{message["FileGroupId"]}</div>
                <div className="item-date">{message["MessageDate"]}</div>
            </div>
        </div>
    )) : null
)
);

const RenderMessageHistory = ({ targetMessage }) => {
    const [fileState, deleteFileHandler, getInputProps, getRootProps] = useFile();

    const [date, time] = parseDate(targetMessage['MessageDate']);

    return (
        <div className="message__view-history">
            <div className="message__view-history__header">
                <div className="message__view-history__header-detail">
                    <div className="detail-from">
                        <span>{"From:"}&emsp;</span>
                        <span>{targetMessage["MessageFrom"]}</span>
                    </div>
                    <div className="detail-to">
                        <span>{"To:"}&emsp;</span>
                        <span>{targetMessage["MessageTo"]}</span>
                    </div>
                </div>
                <div className="message__view-history__header-date">
                    <div className="detail-date">
                        <span>{targetMessage && date}</span>
                    </div>
                    <div className="detail-time">
                        <span>{targetMessage && `at ${time}`}</span>
                    </div>
                </div>
            </div>
            <div className="message__view-history__body">
                <div className="message-chat">
                    <div className="message-item">
                        <div className="message-item__title">
                            <h3>{targetMessage["Subject"]}</h3>
                        </div>
                        <div className="message-item__text">
                            {
                                targetMessage && targetMessage["MessageText"].split('\n')
                                    .filter((str) => str !== "" && str !== " ")
                                    .map((str) => {
                                        const unique = uId();
                                        return (
                                            <p key={unique}>{str.trim()}</p>
                                        )
                                    })
                            }
                        </div>
                    </div>
                </div>
                <div className="message-controls">
                    <div className="message-controls-info">
                        <span className="message-controls-info__title">{"To:"}</span>
                        <span
                            className="message-controls-info__sub-title">{targetMessage && targetMessage["MessageTo"]}</span>
                    </div>
                    <div className="message-controls-text">
                        <Textarea
                            className="textarea"
                            name="message"
                            placeholder="Write a message"
                        />
                    </div>
                    <div className="message-controls-file">
                        <UploadFiles getRootProps={getRootProps} getInputProps={getInputProps} />
                        {
                            fileState.length > 0 ? (
                                <div className="file-dropzone-list">
                                    {fileState.map((file) => (
                                        <div className="file-wrap" key={file.lastModified}>
                                            <div className="file">
                                                <label className="file__name">
                                                    <span>{file.name}</span>
                                                    <Button
                                                        type="button"
                                                        className="file__button"
                                                        onClick={deleteFileHandler(file.lastModified)}>{"X"}</Button>
                                                </label>
                                            </div>
                                            <span className="file__size">{bytesToSize(file.size)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : null
                        }
                    </div>
                    <div className="message-controls-send">
                        <Button type="button" className="btn btn-green">{"Send"}</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Messages;
