import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { ThemeProvider } from 'styled-components';
import theme from '../constants/theme';
import Home from '../container/home';
import Room from '../container/room';

function App() {
  return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
            <Route exact strict path="/" component={Home} />
            <Route exact strict path="/:id" component={Home} />
            <Route exact strict path="/room/:id" component={Room} />
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;
