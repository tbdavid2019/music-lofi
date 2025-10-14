import * as Tone from 'tone';
import Samples from './Samples';

// 優化音頻處理鏈
const hpf = new Tone.Filter(150, "highpass");  // 高通濾波器清理低頻
const lpf = new Tone.Filter(1200, "lowpass");  // 稍微提高低通頻率  
const compressor = new Tone.Compressor({
	threshold: -12,
	ratio: 2,
	attack: 0.01,
	release: 0.1
});
const reverb = new Tone.Reverb(0.5);  // 減少 reverb
const sw = new Tone.StereoWidener(0.3);  // 減少立體聲寬度

class Piano {
	sampler: any;
	
	constructor(cb: () => void) {
		this.sampler = new Tone.Sampler(Samples, () => {
			cb();
		}).chain(hpf, compressor, lpf, reverb, sw, Tone.Master);
	}
}

export default Piano;