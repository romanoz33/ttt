import React, { useCallback, useEffect, useState } from 'react';
import { useOverrides } from '@quarkly/components';
import { Box, Icon, Image } from '@quarkly/widgets';
import { enableScroll, disableScroll } from './GalleryScrollBlock';
import GalleryLoader from './GalleryLoader';
import { IoMdClose } from "react-icons/io";
const overrides = {
	'Overlay': {
		kind: 'Box',
		props: {
			'display': 'flex',
			'align-items': 'center',
			'justify-content': 'center',
			'background': 'rgba(0, 0, 0, .7)',
			'position': 'fixed',
			'bottom': 0,
			'right': 0,
			'left': 0,
			'top': 0
		}
	},
	'Overlay :open': {
		kind: 'Box',
		props: {
			'opacity': 1,
			'visibility': 'visible',
			'transition-duration': '.3s',
			'transition-property': 'opacity, visibility, z-index',
			'z-index': 110
		}
	},
	'Overlay :close': {
		kind: 'Box',
		props: {
			'opacity': 0,
			'visibility': 'hidden',
			'transition-duration': '.3s',
			'transition-property': 'opacity, visibility, z-index',
			'z-index': -1
		}
	},
	'Image': {
		kind: 'Lightbox Image',
		props: {
			'margin': '0 auto',
			'max-width': '80%',
			'max-height': '80%',
			'min-height': '0',
			'min-weight': '0'
		}
	},
	'Close': {
		kind: 'Icon',
		props: {
			'size': '30px',
			'color': '#fff',
			'position': 'absolute',
			'top': '15px',
			'right': '20px',
			'cursor': 'pointer',
			'category': 'io',
			'icon': IoMdClose,
			'z-index': '124'
		}
	},
	'Loader': {
		kind: 'Icon'
	}
};
const zoomInStyles = {
	'max-width': '100%',
	'max-height': '100%',
	'cursor': 'zoom-out'
};
const zoomOutStyles = {
	'max-width': '80%',
	'max-height': '80%',
	'cursor': 'zoom-in'
};
const openStyles = {
	'opacity': 1,
	'visibility': 'visible',
	'transform': 'scale(1)',
	'transition-duration': '.3s',
	'transition-timing-function': 'ease-in-out',
	'transition-property': 'opacity, visibility, z-index, transform, max-height, max-width',
	'z-index': 110
};
const closedStyles = {
	'opacity': 0,
	'visibility': 'hidden',
	'transform': 'scale(.9)',
	'transition-duration': '.3s',
	'transition-timing-function': 'ease-in-out',
	'transition-property': 'opacity, visibility, z-index, transform, max-height, max-width',
	'z-index': -1
};

const stopEventClick = e => e.stopPropagation();

const Lightbox = ({
	defaultFullImageSrc,
	someImageFullParams,
	setSomeImageFullParams,
	isOpen,
	setOpen,
	isBigImage,
	setBigImage,
	isZoom,
	setZoom,
	offScrollProp,
	isPreviewClicked,
	setPreviewClicked,
	loadImage,
	hideLoaderFullImage,
	...props
}) => {
	const [isLoadingFullImage, setLoadingFullImage] = useState(true);
	useEffect(() => {
		if (!isOpen) enableScroll();
	}, [isOpen]);
	const closeLightbox = useCallback(() => {
		setLoadingFullImage(true);
		setOpen(false);
		setZoom(false);
		setPreviewClicked(false);
		setBigImage(false);
		setSomeImageFullParams({});
		if (offScrollProp) enableScroll();
	}, [offScrollProp, isOpen]);
	const closeImageOnEsc = useCallback(e => {
		if (e.keyCode === 27) closeLightbox();
	}, [isOpen]);
	const zoomImage = useCallback(e => {
		stopEventClick(e);
		setZoom(!isZoom);
	}, [isZoom]);
	useEffect(() => {
		if (isPreviewClicked) {
			setOpen(true);
			loadImage(someImageFullParams.src || defaultFullImageSrc).then(img => {
				setLoadingFullImage(false);
				if (offScrollProp) disableScroll();
				if (img.width > window.innerWidth) setBigImage(true);
			});
			window.addEventListener('keydown', closeImageOnEsc);
			return () => window.removeEventListener('keydown', closeImageOnEsc);
		}
	}, [isPreviewClicked]);
	const {
		override,
		rest
	} = useOverrides(props, overrides);
	return <Box {...rest}>
		<Box onClick={closeLightbox} {...override('Overlay', `Overlay ${isOpen ? ':open' : ':close'}`)}>
			<Icon onClick={closeLightbox} {...override('Close')} />
			<Image
				{...override('Image')}
				src={isLoadingFullImage ? '' : someImageFullParams['src'] || defaultFullImageSrc}
				title={someImageFullParams['title']}
				alt={someImageFullParams['alt']}
				srcset={someImageFullParams['srcset']}
				sizes={someImageFullParams['sizes']}
				object-fit={someImageFullParams['object-fit']}
				object-position={someImageFullParams['object-position']}
				loading={someImageFullParams['loading']}
				onClick={zoomImage}
				{...isZoom ? isBigImage && zoomInStyles : isBigImage && zoomOutStyles}
				{...isOpen ? openStyles : closedStyles}
			/>
			{!hideLoaderFullImage && <GalleryLoader {...override('Loader')} isLoading={isLoadingFullImage} />}
		</Box>
	</Box>;
};

Object.assign(Lightbox, {
	overrides
});
export default Lightbox;