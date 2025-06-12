package main

import (
	"bytes"
	"fmt"
	"net/http"
	"sync"
	"time"
)

const (
	poolCount     = 500
	responseCount = 60
	duration      = time.Duration(1 * time.Second)
	url           = "http://localhost:3000/metrics/"
	contentType   = "application/json"
	bodyData      = "{\"metric\": 2}"
)

func main() {

	times := make([]time.Duration, 0, poolCount*responseCount)

	errorCount := 0

	mx := sync.Mutex{}
	wg := sync.WaitGroup{}

	for i := 0; i < responseCount; i++ {
		for j := 0; j < poolCount; j++ {
			go func() {
				defer wg.Done()
				wg.Add(1)
				timeStart := time.Now()
				_, err := http.Post(url, contentType, bytes.NewBufferString(bodyData))
				if err != nil {
					return
				}
				errorCount++
				timeElapsed := time.Since(timeStart)
				defer mx.Unlock()
				mx.Lock()
				times = append(times, timeElapsed)
			}()
		}
		time.Sleep(duration)
	}
	wg.Wait()
	minTime, maxTime := minMax(times)

	fmt.Printf("avg: %fms\n", getAvg(times))
	fmt.Printf("min: %dms\n", minTime)
	fmt.Printf("max: %dms\n", maxTime)
	fmt.Printf("succes: %dms\n", len(times))
	fmt.Printf("errors: %dms\n", poolCount*responseCount-len(times))

}

func getAvg(times []time.Duration) float64 {
	sum := int64(0)
	for _, t := range times {
		sum += t.Milliseconds()
	}

	return float64(sum) / float64(len(times))
}

func minMax(times []time.Duration) (min int64, max int64) {
	if len(times) == 0 {
		return
	}
	min = times[0].Milliseconds()
	max = times[0].Milliseconds()

	for _, t := range times {
		if t.Milliseconds() > max {
			max = t.Milliseconds()
		}
		if t.Milliseconds() < min {
			min = t.Milliseconds()
		}
	}
	return
}
