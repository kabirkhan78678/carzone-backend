import { readAllNotificationsModel, readAllNotificationsModelByIdModel, removeAllNotificationByCurrentUserId, removeCarFromNotificationModelbyNotificationId } from '../../models/user.model.js';
import { variableTypes } from '../../utils/constant.js';
import { handleError, handleSuccess } from '../../utils/responseHandler.js';
import { getMessage } from '../../utils/user_helper.js';

export const readAllNotifications = async (req, res) => {
    try {
        const { id, language } = req.user;
        let updateAllNotification = await readAllNotificationsModel(id);
        return handleSuccess(res, 200, 'Update successfully', updateAllNotification);
    } catch (error) {
        return handleError(res, 500, getMessage('en', variableTypes.INTERNAL_SERVER_ERROR));
    }
};

export const readNotificationsById = async (req, res) => {
    try {
        const { id, language } = req.user;
        const { notificationId } = req.body
        let updateNotificationByIds = await readAllNotificationsModelByIdModel(id)
        return handleSuccess(res, 200, 'Update successfully', updateNotificationByIds);
    } catch (error) {
        return handleError(res, 500, getMessage('en', variableTypes.INTERNAL_SERVER_ERROR));
    }
};

export const removeAllNotification = async (req, res) => {
    try {
        let { language, id } = req.user;
        await removeAllNotificationByCurrentUserId(id);
        return handleSuccess(res, 200, getMessage(language || 'en', variableTypes.ALL_NOTIFICATION_CLEARD));
    } catch (error) {
        return handleError(res, 500, getMessage('en', variableTypes.INTERNAL_SERVER_ERROR));
    }
};

export const removeNotificationById = async (req, res) => {
    try {
        let language = req.user?.language || 'en';
        let targetId = req.body?.notificationId || req.body?.notification_id || req.body?.id || req.params?.notificationId;
        await removeCarFromNotificationModelbyNotificationId(targetId);
        return handleSuccess(res, 200, getMessage(language, variableTypes.ALL_NOTIFICATION_CLEARD));
    } catch (error) {
        return handleError(res, 500, getMessage('en', variableTypes.INTERNAL_SERVER_ERROR));
    }
};

const parseArrayFilter = (value) => {

    if (!value) return [];

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {

        try {

            const parsed = JSON.parse(value);

            return Array.isArray(parsed)
                ? parsed
                : [value];

        } catch (err) {

            return [value];
        }
    }

    return [];
};
