// setup for the recording app
let stream = null,
		audio = null,
		mixedStream = null,
		chunks = [],
		recorder = null,
		startButton = null,
		stopButton = null,
		downloadButton = null,
		recordedVideo = null;

// if you doubt what setup stream is . its basically getting the mic and the screen display thats all
async function setupStream() {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true
		});
		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100
			}
		});

		setupVideoFeedback();
	} catch(err) {
		console.log(err);
	}
}

// Here we setup the video feedback which is this screen
function setupVideoFeedback() {
	if (stream) {
		const video = document.querySelector('.video-feedback');
		video.srcObject = stream;
		video.play();
	} else {
		console.log('No stream');
	}
}

// Starts Recording..

async function startRecording() {
	// Here we wait for setupStream to activate and then
	await setupStream();
	if (stream && audio) {
		// here we get tracks
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		// starts in 2 miliseconds
		recorder.start(200);

		// When we start recording we disable the start button and enable the stop button
		startButton.disabled = true;
		stopButton.disabled = false;

		console.log("Recording Started....")
	} else {
		console.warn("Anything In Console")
	}
}

function handleDataAvailable(e) {
	chunks.push(e.data);
}

// before doing that lets work with stop recording button
function stopRecording() {
	recorder.stop();
	// here we disable the stop button and enable the start button
	startButton.disabled = false;
	stopButton.disabled = true;
	console.log("Recording Stopped....")
}

// Download the recorded video
function handleStop() {
	const blob = new Blob(chunks, {
		// type: video/put extension name here
		type: 'video/mp4'
	});
	chunks = [];
	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = 'video.mp4';
	downloadButton.disabled = false;
	recordedVideo.src = URL.createObjectURL(blob);
	recordedVideo.load();
	recordedVideo.play();

	recordedVideo.onloadedmetadata = function(e) {
		recordedVideo.play();

		const rc = document.querySelector('.recorded-video-wrap');
		rc.classList.remove('hidden');
		// Scroll Below the recorded video
		rc.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	}

	stream.getTracks().forEach(track => track.stop());
	audio.getTracks().forEach(track => track.stop());

	console.log("Recording Has Been Stoped... Download it");
}

// lets get all elements and add event listener to some of them
// THE Extension i am using is - Github Copilot
window.addEventListener('load', () => {
	// get all elements
	startButton = document.querySelector('.start-recording');
	stopButton = document.querySelector('.stop-recording');
	downloadButton = document.querySelector('.download-video');
	recordedVideo = document.querySelector('.recorded-video');

	// add click events
	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
})