import Home from "./pages/Homepage/Home"
import Page1 from "./pages/Page1/Page1"


import { Routes, Route, BrowserRouter } from 'react-router-dom'


export default function App() {
  return(
    <>
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/page1' element={<Page1 />}></Route>
        </Routes>
    </BrowserRouter>
    </>
  );
} 
