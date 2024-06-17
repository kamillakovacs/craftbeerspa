import React from "react";
import ReactDOM from "react-dom";
import modalStyles from "../styles/modal.module.scss";

const Modal = ({ onClose, children, title }) => {
    const handleCloseClick = (e) => {
        e.preventDefault();
        onClose();
    };

    const modalContent = (
        <div className={modalStyles.overlay}>
            <div className={modalStyles.wrapper}>
                <div className={modalStyles.modal}>
                    <div className={modalStyles.header}>
                        <a href="#" onClick={handleCloseClick}>
                            x
                        </a>
                    </div>
                    {title && <h1>{title}</h1>}
                    <div className={modalStyles.body}>{children}</div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        modalContent,
        document.getElementById("modal-root")
    );
};

export default Modal