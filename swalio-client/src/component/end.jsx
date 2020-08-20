import React, {Component} from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    background: ${props => props.theme.colors.background};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    >h1{
        color: ${props => props.theme.colors.white};
        text-align: center;
        font-size: 32px;
        font-weight: 400;
        margin-bottom: 20px;
    }
    >button{
        background: ${props => props.theme.colors.primary};
        color: ${props => props.theme.colors.white};
        font-family: 'Quicksand', sans-serif;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        box-shadow: 0 8px 6px -6px rgba(135,71,171,0.2) ;
        :focus{
            outline: 0;
        }
    }
`;


const End = (props) => {
    return(
        <Wrapper>
            <h1>Meeting has ended!</h1>
            <button onClick={()=> {props.history.push('/')}}>Create Meeting</button>
        </Wrapper>
    )
}

export default End;