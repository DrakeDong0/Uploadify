import React from 'react';
import './Footer.css'

export default function Footer(){
    const currentYear = new Date().getFullYear();

    return(
        <>
            <a className="Source" href="https://github.com/DrakeDong0/Spotify_Project" target="_blank">&lt; &gt; Source Code</a>
            <p className="Footer">© {currentYear} Drake Dong</p>
        </>
    );
}