const axios = require('axios');

const WHATSAPP_TOKEN = 'EAAPbr2pJ7WUBOwn3ZBZBrKHuRK0xBwhTZAWTteACiv7vtksXZAqHBrLNAtEIE5ZCyZCJqOG1IXZBWDZAaZB1hV6kyFxzdwy74Emj6XuUiXtWznG8UUlWTTmtejYrggDu7CVvqKYLOtcDUZBQwVjEnQtUAnDiCSgfmrnOGViQQjgI7jfw88JTlSc8nH7m2lbizg0dVDyMTmVxvzsZBts6lcePcEZD';
const PHONE_NUMBER_ID = '243352265533242';

const sendMessage = async (trigger) => {
    if (!trigger.phoneNumber) {
        throw new Error('Phone number is required');
    }
    if (!trigger.interactiveType) {
        throw new Error('Interactive type is required');
    }
    if (!trigger.body) {
        throw new Error('Message body is required');
    }
    if (!trigger.button) {
        throw new Error('Button title is required');
    }

 
    const payload = {
        messaging_product: "whatsapp",
        to: trigger.phoneNumber,
        type: "interactive",
        interactive: {
            type: trigger.interactiveType.toLowerCase(),
            body: {
                text: trigger.body
            },
            header: trigger.header ? {
                type: "text",
                text: trigger.header
            } : undefined,
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            id: "help_button",
                            title: trigger.button
                        }
                    }
                ]
            }
        }
    };

    try {
        const response = await axios.post(`https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`, payload, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error sending message:', error.response.data);
        } else {
            console.error('Error sending message:', error.message);
        }
        throw new Error('Failed to send message');
    }
};

module.exports = { sendMessage };
