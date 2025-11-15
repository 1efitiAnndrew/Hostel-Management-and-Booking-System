const verifysession = async () => {
    try {
        let response = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/auth/verifysession", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({token: localStorage.getItem("token")})
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let result = await response.json();
        
        if (result.success) {
            if (result.data.isAdmin) {
                window.location.href = "/admin-dashboard";
            } else {
                window.location.href = "/student-dashboard";
            }
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("student");
        }
    } catch (error) {
        console.error("Session verification failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("student");
    }
};

export default verifysession;