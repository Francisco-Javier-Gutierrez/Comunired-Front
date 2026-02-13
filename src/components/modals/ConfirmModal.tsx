import React from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    isLoading?: boolean;
    confirmImage?: string;
    cancelImage?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    isLoading = false,
    confirmImage = "Confirm.svg",
    cancelImage = "Cancel.svg",
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className={`modal fade show d-block ${isLoading ? "disabled" : ""}`}
            tabIndex={-1}
            onClick={onCancel}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div
                    className="modal-content bg-white rounded-4 shadow p-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h4 className={description ? "mb-2" : "mb-4"}>{title}</h4>
                    {description && <p className="text-muted mb-4">{description}</p>}

                    <div className="w-75 mx-auto d-flex align-items-center justify-content-around mt-4">
                        {isLoading ? (
                            <div className="mid-loader"></div>
                        ) : (
                            <img
                                src={confirmImage}
                                alt="Confirmar"
                                className="cursor-pointer"
                                width={50}
                                onClick={onConfirm}
                            />
                        )}
                        <img
                            src={cancelImage}
                            alt="Cancelar"
                            className="cursor-pointer"
                            width={50}
                            onClick={onCancel}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
