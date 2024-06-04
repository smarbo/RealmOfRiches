"use strict";
const loggedInMessage = document.getElementById("loggedInMessage");
const dropMessage = document.getElementById("dropMessage");
const launchButton = document.getElementById("launchButton");
launchButton.onclick = () => {
    window.location.href = "/play/";
};
//@ts-ignore
const checkUser = async () => {
    try {
        const body = {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password"),
        };
        const res = await fetch("/api/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (res.status === 404) {
            localStorage.clear();
        }
        const r = await res.json();
        if (r.authenticated) {
            localStorage.setItem("email", r.email);
            localStorage.setItem("username", r.username);
            localStorage.setItem("balance", r.balance);
            localStorage.setItem("dropEligible", r.dropEligible);
            localStorage.setItem("dropStreak", r.dropStreak);
            localStorage.setItem("inventory", JSON.stringify(r.inventory));
            if (r.dropEligible === true) {
                dropMessage.style.display = "block";
            }
            else {
                dropMessage.style.display = "none";
            }
            return true;
        }
        else if (r.authenticated === false) {
            localStorage.clear();
        }
    }
    catch (err) {
        console.log(err);
    }
};
if (this.localStorage.getItem("username") !== undefined) {
    checkUser();
    if (this.localStorage.getItem("username") == undefined &&
        this.localStorage.getItem("balance") == undefined) {
        loggedInMessage.innerHTML = "<a href='/auth'>Log in/Sign up to play!</a>";
        launchButton.onclick = () => {
            window.location.href = "/auth/";
        };
        launchButton.innerText = "Log In";
    }
    else {
        loggedInMessage.innerHTML = `Welcome back, ${localStorage.getItem("username")}! <a href="/" onclick="localStorage.clear();">Log Out</a><br>You have ${localStorage.getItem("balance")} gems.`;
    }
}
