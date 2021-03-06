import React, { useEffect, useRef, useState } from 'react'
import ReactAudioPlayer from 'react-audio-player'
import { useDispatch, useSelector } from 'react-redux';
import { size } from '../../constants/photo';
import { changePauseSong, setSongPlaying } from '../../features/Song/songSlice';
import './Player.scss';

const classNames = require('classnames');

const randomSongIndex = (length) => {
  return Math.floor(Math.random() * length);
}
function Player(props) {
  const idSongPlaying = useSelector(state => state.songs.playingSong.idSongPlaying);
  const songs = useSelector(state => state.songs.songs);
  const isPause = useSelector(state => state.songs.playingSong.isPause);
  
  const playlist = useSelector(state => state.songs.playlist);
  const isPlayList = useSelector(state => state.songs.isPlayList);
  const dispatch = useDispatch();

  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [songPlay, setSongPlay] = useState(null);
  const [playTracks, setPlayTracks] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlayList && playlist.findIndex(track => track.id === idSongPlaying) !== -1) {
      setPlayTracks(playlist);
    }
    else if (!isPlayList && playlist.findIndex(track => track.id === idSongPlaying) === -1) {
      setPlayTracks(songs)
    }
  }, [isPlayList, playlist, songs, idSongPlaying])

  useEffect(() => {
    setLoop(false);
    setSongPlay(playTracks.find(song => song.id === idSongPlaying));
  }, [idSongPlaying, playTracks]);

  if (isPause === true) {
    audioRef.current && audioRef.current.audioEl.current.pause();
  }
  else if (isPause === false){
    const playSong = audioRef.current && audioRef.current.audioEl.current;
    setTimeout(() => {
      playSong.play();
    }, 150);  // 150ms to avoid Promise play() Error
  }

  const handlePauseSong = () => {
    dispatch(changePauseSong(true));
  }
  const handlePlaySong = () => {
    dispatch(changePauseSong(false));
  }

  const changeSong = (indexSongPlay) => {
    if (indexSongPlay >= 0 && indexSongPlay < playTracks.length) {
      setSongPlay(playTracks[indexSongPlay]);
      dispatch(setSongPlaying(playTracks[indexSongPlay].id));
      dispatch(changePauseSong(false));
    }
  }
  const handleEnded = () => {
    let indexSongPlay;
    shuffle ?
      indexSongPlay = randomSongIndex(playTracks.length)
      :
      indexSongPlay = playTracks.findIndex(song => song.id === idSongPlaying) + 1;
      
    changeSong(indexSongPlay);
  }
  const handleBackSong = () => {
    changeSong(playTracks.findIndex(song => song.id === idSongPlaying) - 1);
  }
  const handleNextSong = () => {
    let indexSongPlay;
    shuffle ? 
    indexSongPlay = randomSongIndex(playTracks.length)
    :
    indexSongPlay = playTracks.findIndex(song => song.id === idSongPlaying) + 1;

    changeSong(indexSongPlay);
  }

  return (
    <div className={classNames({ "footer container-fluid": true, "footer-appear--active": idSongPlaying })}>
      <div className="container d-flex justify-content-between align-items-center">
        <div className="song-footer">
          <div className="song__avatar">
            <img 
              src={
                songPlay && songPlay.artwork_url ? songPlay.artwork_url.replace('-large', size) 
                : "https://colorate.azurewebsites.net/SwatchColor/242526"
                }
              alt="Song's avatar"
            />
          </div>
          <div className="song__details__name">
            <p className="song__name">{songPlay && songPlay.title}</p>
            <p className="song__singer__name">{songPlay && songPlay.user.username}</p>
          </div>
        </div>

        <div className="player">
          <ReactAudioPlayer
            ref={audioRef}
            autoPlay
            controls
            loop={loop}
            src={
              songPlay && 
              `${songPlay.stream_url}?client_id=${process.env.REACT_APP_CLIENT_ID}`
            }

            onPause={handlePauseSong}
            onPlay={handlePlaySong}
            onEnded={handleEnded}
          />
          <div className="player__utils">
            <i 
              className="player__utils--back fas fa-step-backward"
              title="Last song"
              onClick={handleBackSong}
            />
            <i 
              className="player__utils--next fas fa-step-forward"
              title="Next song"
              onClick={handleNextSong}
            />
            <i 
              className={classNames({"player__utils--loop fas fa-sync-alt": true, "active": loop})} 
              title="Replay one"
              onClick={() => setLoop(!loop)}
            />
            <i
              className={classNames({"player__utils--shuffle fas fa-random": true, "active": shuffle})}
              title="Shuffle"
              onClick={() => setShuffle(!shuffle)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

Player.propTypes = {}

export default Player

