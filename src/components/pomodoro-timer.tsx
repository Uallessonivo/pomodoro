import React, { useEffect, useState, useCallback } from 'react'
import { useInterval } from '../hooks/useInterval'
import { secondsToTime } from '../utils/seconds-to-time'
import { Button } from './button'
import { Timer } from './timer'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bellStart = require('../sounds/bellStart.mp3')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bellFinish = require('../sounds/bellFinish.mp3')

const audioStartWorking = new Audio(bellStart)
const audioFinishWorking = new Audio(bellFinish)

interface Props {
    defaultPomodoroTimer: number
    shortRestTime: number
    longRestTime: number
    cycles: number
}

export function PomodoroTimer(props: Props): JSX.Element {
    const [mainTime, setMainTime] = useState(props.defaultPomodoroTimer)
    const [timeCounting, setTimeCounting] = useState(false)
    const [working, setWorking] = useState(false)
    const [resting, setResting] = useState(false)
    const [cyclesQtdManager, setCyclesQtdManager] = useState(
        new Array(props.cycles - 1).fill(true)
    )

    const [completedCycles, setCompletedCycles] = useState(0)
    const [fullWorkingTime, setFullWorkingTime] = useState(0)
    const [numberOfPomodoros, setNumberOfPomodoros] = useState(0)

    useInterval(
        () => {
            setMainTime(mainTime - 1)
            if (working) setFullWorkingTime(fullWorkingTime + 1)
        },
        timeCounting ? 1000 : null
    )

    const configureWorker = useCallback(() => {
        setTimeCounting(true)
        setWorking(true)
        setResting(false)
        setMainTime(props.defaultPomodoroTimer)
        audioStartWorking.play()
    }, [
        setTimeCounting,
        setWorking,
        setResting,
        setMainTime,
        props.defaultPomodoroTimer,
    ])

    const configureRest = useCallback(
        (Long: boolean) => {
            setTimeCounting(true)
            setWorking(false)
            setResting(true)

            if (Long) {
                setMainTime(props.defaultPomodoroTimer)
            } else {
                setMainTime(props.shortRestTime)
            }
            audioFinishWorking.play()
        },
        [
            setTimeCounting,
            setWorking,
            setResting,
            setMainTime,
            props.defaultPomodoroTimer,
            props.shortRestTime,
        ]
    )

    useEffect(() => {
        if (working) document.body.classList.add('working')
        if (resting) document.body.classList.remove('working')

        if (mainTime > 0) return

        if (working && cyclesQtdManager.length > 0) {
            configureRest(false)
            cyclesQtdManager.pop()
        } else if (working && cyclesQtdManager.length <= 0) {
            configureRest(true)
            setCyclesQtdManager(new Array(props.cycles - 1).fill(true))
            setCompletedCycles(completedCycles + 1)
        }

        if (working) setNumberOfPomodoros(numberOfPomodoros + 1)
        if (resting) configureWorker()
    }, [
        working,
        resting,
        mainTime,
        configureRest,
        setCyclesQtdManager,
        configureWorker,
        cyclesQtdManager,
        numberOfPomodoros,
        props.cycles,
        completedCycles,
    ])

    return (
        <div className="pomodoro">
            <h2>Você está: {working ? 'Trabalhando' : 'Descansando'}!</h2>
            <Timer mainTimer={mainTime} />
            <div className="controls">
                <Button text="Work" onClick={() => configureWorker()}></Button>
                <Button
                    text="Rest"
                    onClick={() => configureRest(false)}
                ></Button>
                <Button
                    className={!working && !resting ? 'hidden' : ''}
                    text={timeCounting ? 'Pause' : 'Play'}
                    onClick={() => setTimeCounting(!timeCounting)}
                ></Button>
            </div>
            <div className="details">
                <p>Ciclos concluídos: {completedCycles}</p>
                <p>Horas Trabalhadas: {secondsToTime(fullWorkingTime)}</p>
                <p>Pomodoros concluídos: {numberOfPomodoros}</p>
            </div>
        </div>
    )
}
