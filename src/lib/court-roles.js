import kingWorm from '#lib/assets/king_worm.gif';
import nakedWorm from '#lib/assets/naked_worm.gif';
import suitedWorm from '#lib/assets/suited_worm.gif';

export const courtRoles = {
	judge: {
		name: 'Judge',
		worm: kingWorm
	},
	prosecution: {
		name: 'Prosecution',
		worm: suitedWorm
	},
	defense: {
		name: 'Defense',
		worm: nakedWorm
	}
};
