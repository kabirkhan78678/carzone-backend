import { isUsersExistsOrNot, deleteEmail, deleteRoleByUserId, userRegistration } from '../../models/user.model.js';
import { variableTypes } from '../../utils/constant.js';
import { handleError } from '../../utils/responseHandler.js';
import { sendEmail } from '../../utils/emailService.js';
import { hashPassword, sendVerificationEmail, getMessage } from '../../utils/user_helper.js';

export const userSignUp = async (req, res) => {
    let {
        account_type,
        fullName,
        confirm_password,
        companyName,
        companyAddress,
        commercialRegisterNumber,
        city,
        postalCode,
        businessPhone,
        mobilePhone,
        whatsappNumber,
        email,
        password,
        language
    } = req.body;

    try {
        const lang = (language || "en").toLowerCase();
        const code = Math.floor(1000 + Math.random() * 9000);
        const existingUsers = await isUsersExistsOrNot(email);

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            if (existingUser.isVerified == 1) {
                if (existingUser.account_type === 'company' && existingUser.is_activated != 1) {
                    return handleError(res, 400, getMessage(lang, variableTypes.ACCOUNT_UNDER_REVIEW));
                }
                return handleError(res, 400, getMessage(lang, variableTypes.ALLREADY_HAVE_ACCOUNT));
            }

            await deleteEmail(email);
            await deleteRoleByUserId(existingUser.id);
        }

        const hash = await hashPassword(password);

        if (account_type === 'private') {
            if (password !== confirm_password) {
                return handleError(res, 400, getMessage(lang, variableTypes.PASSWORD_DO_NOT_MATCH));
            }

            const user = {
                account_type: 'private',
                fullName: (fullName || '').trim(),
                email,
                password: hash,
                language: lang,
                code,
                isVerified: 0,
                is_activated: 1,
                isSeller: 0
            };

            const createUser = await userRegistration(user);

            if (!createUser) {
                return handleError(res, 400, getMessage(lang, variableTypes.FALIED_TO_USERS_CREATE));
            }

            await sendVerificationEmail({
                userData: { email, language: lang },
                code,
                res
            });

            return;
        }

        if (account_type === 'company') {
            const user = {
                account_type: 'company',
                fullName: companyName,
                companyName,
                email,
                password: hash,
                language: lang,
                phoneNumber: mobilePhone || null,
                business_phone: businessPhone || null,
                whatsappNumber: whatsappNumber || null,
                companyAddress,
                city,
                pincode: postalCode,
                uid: commercialRegisterNumber || null,
                code,
                isVerified: 0,
                is_activated: 0,
                isSeller: 0
            };

            const createUser = await userRegistration(user);

            if (!createUser) {
                return handleError(res, 400, getMessage(lang, variableTypes.FALIED_TO_USERS_CREATE));
            }

            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: "New Company Registration Submitted",
                html: `
                    <h3>New company registration submitted</h3>
                    <p><strong>Company Name:</strong> ${companyName}</p>
                    <p><strong>Commercial Register Number:</strong> ${commercialRegisterNumber || "N/A"}</p>
                    <p><strong>Company Address:</strong> ${companyAddress || "N/A"}</p>
                    <p><strong>City:</strong> ${city}</p>
                    <p><strong>Postal Code:</strong> ${postalCode}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Business Phone:</strong> ${businessPhone}</p>
                    <p><strong>Mobile Phone:</strong> ${mobilePhone || "N/A"}</p>
                    <p><strong>WhatsApp Number:</strong> ${whatsappNumber || "N/A"}</p>
                `
            });

            await sendVerificationEmail({
                userData: { email, language: lang },
                code,
                res
            });

            return;
        }

        return handleError(res, 400, getMessage(lang, variableTypes.INVALID_ACCOUNT_TYPE));
    } catch (err) {
        console.error(err);
        return handleError(res, 500, getMessage('en', variableTypes.INTERNAL_SERVER_ERROR));
    }
};

//         fullName,
//         email,
//         password,
//         phoneNumber,
//         whatsappNumber,
//         isWhatsappSameAsPhone,
//         language,
//         fullAddress,
//         fulladdress, // Handle frontend field name
//         typeOfSeller,
//         legalForm,
//         companyName,
//         companyAddress,
//         vat,
//         isSeller,
//         countryCode,
//         // whatsappCountryCode code by raj
//         whatsappCountryCode,
//         uid,
//         pincode,
//         city
//     } = req.body;

//     // Fix field name mismatch - frontend sends 'fulladdress', we need 'fullAddress'
//     if (!fullAddress && fulladdress) {
//         fullAddress = fulladdress;
//     }

//      try {

//         await deleteEmail(email);
//         await deleteRoleByUserId(userId);
//     }

//             role = 'buyer';
//             userRole = await fetchRoleByUsersId(data[0].id, role);
//             } else {
//             }
//         } else {
//             role = 'seller';
//             userRole = await fetchRoleByUsersId(data[0].id, role);
//             } else {
//             }
//         }
//     }

//     // ✅ Normalize WhatsApp flag
//         isWhatsappSameAsPhone === true ||
//         isWhatsappSameAsPhone === 1 ||
//         isWhatsappSameAsPhone === "true";

//     // ✅ Assign WhatsApp number safely
//         whatsappNumber = phoneNumber;
//         // added 1 line by raj 
//         whatsappCountryCode = countryCode;
//     } else {
//         whatsappNumber = whatsappNumber || null;
//         // added 1 line by raj 
//         whatsappCountryCode = whatsappCountryCode || null;
//     }

//     console.log('hash', hash)

//         fullName,
//         email,
//         password: hash,
//         phoneNumber,
//         whatsappNumber,
//         countryCode,
//         // added below one line by raj 
//         whatsappCountryCode,
//         code,
//         language,
//         city,
//         isVerified: 0,
//         isSeller
//     };

//         user.legalForm = legalForm;
//         user.companyName = companyName;
//         user.companyAddress = companyAddress;
//         user.vat = vat;
//         user.uid = uid || null;
//         user.pincode = pincode;
//         user.city = city;
//         user.fullAddress = null; //keep full Address
//     } else {
//         user.legalForm = null;
//         user.companyName = null;
//         user.companyAddress = null;
//         user.vat = null;
//         user.fullAddress = fullAddress; // keep personal address
//         user.pincode = pincode; // personal pincode
//     }

//                 user_id: userId,
//                 role: isSeller == 1 ? 'seller' : 'buyer',
//                 seller_type: isSeller == 1 ? (typeOfSeller === 'business' ? 'business' : 'personal') : null,
//                 is_active: 1
//             };
//             await insertUserRole(rolePayload);

//             // ✅ Send Verification Email
//             await sendVerificationEmail({ userData, code, res });
//         } else {
//         }
//     }

//     } catch (err) {
//         console.error(err);
//     }
// };
