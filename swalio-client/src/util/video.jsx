import React, { Component, useEffect } from 'react';
import styled from 'styled-components';
import { socket } from '../App';
import { constants } from '../constants/request';

const VideoBox = styled.video`
    height: 300px;
    width: 450px;
    background: ${props => props.theme.colors.black};
    border-radius: 5px;
`;

let rtcPeerConnection;

const Video =(props) => {
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            console.log(props.vidRef);
            props.showStream(stream, props.key)
            socket.on('ready', function () {
                if (props.current.create) {
                    rtcPeerConnection = new RTCPeerConnection(constants.iceServers);
                    rtcPeerConnection.onicecandidate = props.onIceCandidate;
                    rtcPeerConnection.ontrack = (event)=> props.onAddStream(event,props.key);
                    rtcPeerConnection.addTrack(stream.getTracks()[0], stream);
                    rtcPeerConnection.addTrack(stream.getTracks()[1], stream);
                    rtcPeerConnection.createOffer()
                        .then(sessionDescription => {
                            rtcPeerConnection.setLocalDescription(sessionDescription);
                            socket.emit('offer', {
                                type: 'offer',
                                sdp: sessionDescription,
                                room: props.room
                            });
                        })
                        .catch(error => {
                            console.log(error)
                        })
                }
            });
            socket.on('offer', function (event) {
                if (!props.current.create) {
                    rtcPeerConnection = new RTCPeerConnection(constants.iceServers);
                    rtcPeerConnection.onicecandidate = props.onIceCandidate;
                    rtcPeerConnection.ontrack = (event)=> props.onAddStream(event,props.key);
                    rtcPeerConnection.addTrack(stream.getTracks()[0], stream);
                    rtcPeerConnection.addTrack(stream.getTracks()[1], stream);
                    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
                    rtcPeerConnection.createAnswer()
                        .then(sessionDescription => {
                            rtcPeerConnection.setLocalDescription(sessionDescription);
                            socket.emit('answer', {
                                type: 'answer',
                                sdp: sessionDescription,
                                room: props.room
                            });
                        })
                        .catch(error => {
                            console.log(error)
                        })
                }
            });
        });
    });
    return(
        <VideoBox ref={props.vidRef} />
    )
}

export default Video;
