import { getNotificationTranslation } from '../../services/notification.service.js';
import { getUserById } from '../../models/admin.model.js';
import { modelfetchNotificationByBuyersIds, getCarDetailsById, getExistingPurchaseAgreement, getPhysicalVisitForNotificationModel } from '../../models/user.model.js';
import { variableTypes } from '../../utils/constant.js';
import { handleError, handleSuccess } from '../../utils/responseHandler.js';
import { getMessage, stripHtml, getChfFormattedPrice } from '../../utils/user_helper.js';

export const fetchNotificationByBuyersIds = async (req, res) => {
    try {
        const { id, language } = req.user;
        const { isUserType } = req.query; 

        // ============================================
        // GET NOTIFICATIONS
        // ============================================

        let allNotifications;

        if (isUserType == 1) {
            allNotifications =
                await modelfetchNotificationByBuyersIds(
                    id,
                    1
                );
        } else {
            allNotifications =
                await modelfetchNotificationByBuyersIds(
                    id,
                    1
                );
        }

        // ============================================
        // NO NOTIFICATIONS
        // ============================================

        if (!allNotifications || allNotifications.length === 0) {
            return handleSuccess(
                res,
                200,
                getMessage(
                    language,
                    variableTypes.NO_NOTIFICATION_YET
                ),
                []
            );
        }

        // ============================================
        // CURRENT USER LANGUAGE
        // ============================================

        const userLanguage = language || "en";

        // ============================================
        // TRANSLATE NOTIFICATIONS
        // ============================================

        const translatedNotifications =
            await Promise.all(
                allNotifications.map(async (item) => {

                    let titleKey = null;
                    let bodyKey = null;

                    let params = {};

                    // Keep DB values as fallback
                    let title = item.title;
                    let body = item.body;

                    // ====================================
                    // NOTIFICATION TYPE
                    // ====================================

                    switch (item.notificationType) {

                        // --------------------------------
                        // CAR LISTED
                        // --------------------------------

                        case "car_listed":

                            titleKey =
                                "NEW_CAR_LISTED";

                            bodyKey =
                                "NEW_CAR_LISTED_BODY";

                            params = {};

                            break;

                        // --------------------------------
                        // CAR INQUIRY
                        // --------------------------------

      case "car_inquiry":

    titleKey =
        "NEW_CAR_INQUIRY";

    bodyKey =
        "NEW_CAR_INQUIRY_BODY";

    try {

        // =========================
        // Get Inquiry Sender
        // =========================

        const sender =
            await getUserById(
                item.sendFrom
            );

        // =========================
        // Get Car Details
        // =========================

        const car =
            await getCarDetailsById(
                item.carId
            );

        const senderName =
            sender?.[0]?.fullName ||
            sender?.fullName ||
            "User";

        const carName =
            car?.brandName ||
            car?.carModel ||
            "the car";

        params = {
            name: senderName,
            car: carName
        };

    } catch (inquiryError) {

        console.error(
            `Failed to get car inquiry details for notification ${item.id}:`,
            inquiryError
        );

        // Keep DB value if dynamic data
        // cannot be fetched
        titleKey = null;
        bodyKey = null;
    }

    break;

   
                        // --------------------------------
                        // PURCHASE AGREEMENT
                        // --------------------------------

     case "purchase_agreement":

    try {

        const agreement =
            await getExistingPurchaseAgreement({
                buyer_id: item.sendFrom,
                seller_id: item.sendTo,
                car_id: item.carId
            });

        if (agreement) {

            const buyer =
                await getUserById(item.sendFrom);

            const car =
                await getCarDetailsById(item.carId);

            const carName =
                car?.brandName ||
                car?.carModel ||
                "the car";

            const senderName =
                buyer?.[0]?.fullName ||
                buyer?.fullName ||
                "Buyer";

            const offeredPrice =
                agreement.counter_price !== null &&
                agreement.counter_price !== undefined
                    ? agreement.counter_price
                    : agreement.sale_price;

            titleKey =
                "NEW_PURCHASE_AGREEMENT";

            bodyKey =
                "NEW_PURCHASE_AGREEMENT_BODY";

            params = {
                name: senderName,
                car: carName,
                offeredPrice:
                    offeredPrice !== null && offeredPrice !== undefined && offeredPrice !== ''
                        ? getChfFormattedPrice(offeredPrice)
                        : offeredPrice
            };
        }

    } catch (agreementError) {

        console.error(
            `Failed to get purchase agreement details for notification ${item.id}:`,
            agreementError
        );
    }

    break;

    
                       case "physical_visit":

    try {
        const visit =
            await getPhysicalVisitForNotificationModel({
                carId: item.carId,
                senderId: item.sendFrom,
                receiverId: item.sendTo
            });

        if (visit) {

            if (Number(visit.user_id) === Number(id)) {

                titleKey = "VISIT_REQUEST_SUBMITTED";
                bodyKey = "VISIT_REQUEST_SUBMITTED_BODY";

                params = {
                    car:
                        visit.brandName ||
                        visit.carModel ||
                        "the car",

                    date: visit.visit_date,
                    time: visit.visit_time
                };

            } else if (Number(visit.seller_id) === Number(id)) {

                titleKey = "NEW_VISIT_REQUEST";
                bodyKey = "NEW_VISIT_REQUEST_BODY";

                params = {
                    name:
                        visit.full_name ||
                        visit.buyer_name ||
                        "User",

                    date: visit.visit_date,
                    time: visit.visit_time
                };
            }
        }

    } catch (visitError) {

        console.error(
            "PHYSICAL VISIT ERROR:",
            visitError
        );
    }

    break;
                      
    case "plan_expired":

    titleKey =
        "PLAN_EXPIRED";

    bodyKey =
        "PLAN_EXPIRED_BODY";

    params = {};

    break;

case "plan_expiry_reminder":

    titleKey =
        "PLAN_EXPIRY_REMINDER";

    bodyKey =
        "PLAN_EXPIRY_REMINDER_BODY";

    params = {};

    break;

    // --------------------------------
                        // UNKNOWN NOTIFICATION
                        // --------------------------------

                        default:

                            titleKey = null;
                            bodyKey = null;

                            break;
                    }

                    // ====================================
                    // TRANSLATE
                    // ====================================

                    if (
                        titleKey &&
                        bodyKey
                    ) {

                        const translated =
                            getNotificationTranslation(
                                userLanguage,
                                titleKey,
                                bodyKey,
                                params
                            );

                        title =
                            translated.title;

                        body =
                            translated.body;
                    }

                    // ====================================
                    // SAME RESPONSE STRUCTURE
                    // ====================================

                    return {
                        ...item,

                        title: stripHtml(title),
                        body: stripHtml(body)
                    };
                })
            );

        // ============================================
        // UNREAD COUNT
        // ============================================

        translatedNotifications.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            if (timeB !== timeA) {
                return timeB - timeA;
            }
            return (b.id || 0) - (a.id || 0);
        });

        const unreadCount =
            translatedNotifications.filter(
                item => item.isRead === 0
            ).length;

        // ============================================
        // RESPONSE
        // ============================================

        const data = {
            allNotification:
                translatedNotifications,

            unReadNotifications:
                unreadCount
        };

        return handleSuccess(
            res,
            200,
            getMessage(
                language,
                variableTypes.NOTIFICATION_LIST_FOUND_SUCCESFULLY
            ),
            data
        );

    } catch (error) {

        console.error(
            "fetchNotificationByBuyersIds error:",
            error
        );

        return handleError(
            res,
            500,
            getMessage(
                "en",
                variableTypes.INTERNAL_SERVER_ERROR
            )
        );
    }
};
