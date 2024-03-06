import React, { useEffect } from "react";
import "./Home.css"

import BG_Video from "../../Components/BG_Video";
import Footer from "../../Components/Footer/Footer"


const handleLogin = () => {
    const client_id = "11a53d57252045948aba4b16e6872e80"; 
    const redirect_uri = encodeURIComponent("http://localhost:5173/page1"); 
    const scopes = encodeURIComponent("user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private user-read-playback-state user-top-read");
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes}&show_dialog=true`;

    window.location.href = spotifyAuthUrl;
};


function HomeContent(){
    return(
        <div className="container">
            <p id="Title">Uploadify</p>
            <p id="Login-Text">Import & Export your music with just a few clicks.</p>
            <button onClick={handleLogin} id='Login-Button' href="#"><span>Login With Spotify</span></button>
        </div>
    );
}

export default function Home(){
    return(
        <>
            <BG_Video></BG_Video>
            <HomeContent></HomeContent>
            <Footer></Footer>
        </>
    );
}

