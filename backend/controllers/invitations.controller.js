import invitationService from "../services/invitations.service.js";
import Response  from "../utils/Response.js";

const invitationController = {
    getDetails: async (req, res) => {
        try {
            const invitationID = parseInt(req.params.id);
            const invitationDetails = await invitationService.getDetails(invitationID);
            const response = Response.ok(invitationDetails, "Invitation details retrieved successfully");
            return res.status(response.status).json(response.toJSON());
        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    sendInvite: async (req, res) => {
        try {
            const sentInvite = await invitationService.sendInvite(req.user.id, req.body);
            const response = Response.ok(sentInvite, "Group invitation sent successfully");
            return res.status(response.status).json(response.toJSON());
        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    sendRequest: async (req, res) => {
        try {
            const sentRequest = await invitationService.sendRequest(req.user.id, req.body);
            const response = Response.ok(sentRequest, "Request to join group sent successfully");
            return res.status(response.status).json(response.toJSON());
        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    startGroup: async (req, res) => {
        try {
            const sentStartGroupRequest = await invitationService.startGroup(req.user.id, req.body);
            const response = Response.ok(sentStartGroupRequest, "Request to join group sent successfully");
            return res.status(response.status).json(response.toJSON());
        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    acceptInvite: async (req, res) => {
        console.log("=== ACCEPT INVITE CONTROLLER START ===");
        console.log("Params:", req.params);
        console.log("User:", req.user?.id);
        try {
            const invitationID = parseInt(req.params.id);
            console.log("Parsed invitation ID:", invitationID);


            if (!invitationID || isNaN(invitationID)) {
                console.log("Invalid invitation ID");
                const response = new Response({ status: 400 }, "Invalid invitation ID");
                return res.status(response.status).json(response.toJSON());
            }
            console.log("About to call invitationService.acceptInvite");
            const acceptedInvite = await invitationService.acceptInvite(req.user.id, invitationID);
            console.log("Service returned:", JSON.stringify(acceptedInvite, null, 2));
            console.log("Creating response...");
            const response = Response.ok(acceptedInvite, `Invitation accepted successfully. You are now a member of ${acceptedInvite.group_name}`);
            console.log("Response created:", response);
            console.log("About to send response...");
            return res.status(response.status).json(response.toJSON());
            console.log("Response sent successfully");
        }
        catch (error) {
            console.log("=== ACCEPT INVITE ERROR ===");
            console.log("Error type:", error.constructor.name);
            console.log("Error message:", error.message);
            console.log("Error status:", error.status);
            console.log("Error stack:", error.stack);
            console.log("=== END ERROR ===");

            if (error.status) {
                throw error; // Re-throw known errors
            }
            // const status = error.status || 500;
            // const response = new Response({ status }, error.message);
            // return res.status(response.status).json(response.toJSON());

            throw error;
        }
    },

    declineInvite: async (req, res) => {
        try {
            const invitationID = parseInt(req.params.id);
            const declinedInvite = await invitationService.declineInvite(req.user.id, invitationID);
            const response = Response.ok(declinedInvite, "Invitation declined successfully.");
            return res.status(response.status).json(response.toJSON());
        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    cancelInvite: async (req, res) => {
        try {
            const invitationID = parseInt(req.params.id);
            const cancelledInvite = await invitationService.cancelInvite(req.user.id, invitationID);
            const response = Response.ok(cancelledInvite, "Invitation cancelled successfully.");
            return res.status(response.status).json(response.toJSON());
        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    notifyUser: async (req, res) => {
        try {

        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    },

    clearExpired: async (req, res) => {
        try {

        }
        catch (error) {
            const status = error.status || 500;
            const response = new Response({ status }, error.message);
            return res.status(response.status).json(response.toJSON());
        }
    }

};

export default invitationController;