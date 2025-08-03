import React from 'react';
import { Circles } from 'react-loader-spinner';

function LoadingScreen() {

  return (
    <div className='loading-Container'>
      <Circles 
      width= "80px"
      height= "80px"
      ariaLabel='Loading...'
      color='#103D81' />
      <p className='Text' style={{textAlign: "center"}}>Loading your personalized recommendation...</p>
    </div>
  )
}

export default LoadingScreen;
