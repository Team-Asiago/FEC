import React from 'react';
import { useState, useEffect } from 'react';
import { getProduct, getProductStyles, postItemToCart, getRating } from './poAxios';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Link from '@mui/material/Link';
import trackClick from './tracker';
import InnerImageZoom from 'react-inner-image-zoom';
import './innerzoom.css';


const useStyles = makeStyles((theme) => ({
  large: {
    height: '7vmin',
    width: '7vmin'
  },
  formControl: {
    minWidth: '100%'
  },
  galBar: {
    height: '6vmax',
    width: '6vmax'
  },
  selectedPhotoMark: {
    width: '6vmax'
  },
  strike: {
    'text-decoration': 'line-through'
  },
  sale: {
    color: 'red'
  },
  productInfoComponent: {
    'margin-top': '1vw'
  },
  descText: {
    padding: '1vw'
  },
  buttonBox: {
    height: '4vmax',
    width: '6vmax'
  }
}));

function StyleSelect(props) {
  const classes = useStyles();
  const [style, setStyle] = useState(props.style);
  const [thumbnails, setThumbnails] = useState([]);
  useEffect(() => {
    let thumbs = [];
    for (let i = 0; i < props.styles.length; i++) {
      thumbs.push(props.styles[i].photos[0].thumbnail_url);
    }
    setStyle(props.style);
    setThumbnails(thumbs);
  }, [props]);

  function updateIndex(e) {
    props.changeIndex(parseInt(e.target.alt));
  }
  return (
    <Grid container spacing={3}>
      <Grid item>
        <Typography>{'style > ' + style.name}</Typography>
      </Grid>
      <Grid item container justifyContent="space-evenly" alignItems="center" spacing={2}>
        {thumbnails.map((url, index) => {
          if (index === props.styleIndex) {
            return (
              <Grid item xs={3} key={index}>
                <Badge color='primary' badgeContent='' overlap='circular'>
                  <Avatar alt={'' + index} src={url} className={classes.large} id="style-select" onClick={(e) => { trackClick(e, 'product-overview', updateIndex) }} />
                </Badge>
              </Grid>
            )
          } else {
            return (
              <Grid item xs={3} key={index}>
                <Avatar alt={'' + index} src={url} className={classes.large} id="style-select" onClick={(e) => { trackClick(e, 'product-overview', updateIndex) }} />
              </Grid>
            )
          }
        })}
      </Grid>
    </Grid>
  );

}

function AddToCart(props) {
  const classes = useStyles();
  const [size, setSize] = useState('');
  const [sizes, setSizes] = useState([{ sku: '', size: '', quantity: '' }]);
  const [quantity, setQuantity] = useState('');
  const [skuQty, setSkuQty] = useState(undefined);
  const sizeStrings = {
    XS: 'X-Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'X-Large',
    XXL: 'XX-Large'
  }
  useEffect(() => {
    setSize('');
    let skus = [];
    for (let key in props.style.skus) {
      skus.push({ sku: key, size: props.style.skus[key].size, quantity: props.style.skus[key].quantity })
    }
    setSizes(skus);
  }, [props])
  function handleSizeChange(e) {
    setSize(e.target.value);
    setSkuQty(props.style.skus[e.target.value].quantity);
    setQuantity('');
  }
  function handleQuantityChange(e) {
    setQuantity(e.target.value);
  }
  function quantitySelectBuilder(qty) {
    if (qty > 0) {
      let list = [];
      if (qty > 15) {
        qty = 15;
      }
      for (let i = 1; i <= qty; i++) {
        list.push(<MenuItem value={i} key={i - 1}>{i}</MenuItem>);
      }
      return (list);
    } else {
      return <MenuItem value='out'><em>OUT OF STOCK</em></MenuItem>;
    }
  }
  function addskuToCart() {
    let i = 0
    while (i < quantity) {
      postItemToCart(size)
        .catch((err) => { console.log('failed to add to cart') });
      i++;
    }
    console.log(`added ${i} items with sku ${size}`)
  }
  return (
    <Grid container spacing={3} className={classes.productInfoComponent}>
      <Grid item container>
        <Grid item xs={8} >
          <FormControl className={classes.formControl}>
            <InputLabel >Select Size</InputLabel>
            <Select
              value={size}
              onChange={handleSizeChange}
            >
              {sizes.map((sizeObj, index) => <MenuItem value={sizeObj.sku} key={index}>{sizeStrings[sizeObj.size]}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl className={classes.formControl} disabled={size === ''}>
            <InputLabel >Quantity</InputLabel>
            <Select
              id="qty_select"
              value={quantity}
              onChange={handleQuantityChange}
            >
              {quantitySelectBuilder(skuQty)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item container justifyContent='center'>
        <Grid item xs={12}>
          <Button onClick={(e) => { trackClick(e, 'product-overview', addskuToCart) }} variant="contained" className={classes.formControl} disabled={quantity === ''}>Add To Cart</Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

function Gallery(props) {
  const classes = useStyles();
  const [photos, setPhotos] = useState(props.photos);
  const [mainPhotoIndex, setIndex] = useState(0);
  const [barIndex, setBarIndex] = useState(0);
  useEffect(() => {
    setPhotos(props.photos);
    setIndex(0);
    setBarIndex(0);
  }, [props]);

  function changeIndex(e) {
    setIndex(parseInt(e.target.alt));
  }

  function imgBar(firstIndex) {
    let htmlArr = [];
    let onScreen = 0;
    while (onScreen < 4 && firstIndex + onScreen < photos.length) {
      if (firstIndex + onScreen === mainPhotoIndex) {
        htmlArr.push(
          <Avatar src={photos[firstIndex + onScreen].thumbnail_url} variant="square" className={classes.galBar} alt={firstIndex + onScreen + ''} key={firstIndex + onScreen} />,
          <Divider variant="inset" color="secondary" className={classes.selectedPhotoMark} key={-5} />
        );
      } else {
        htmlArr.push(<Avatar src={photos[firstIndex + onScreen].thumbnail_url} variant="square" className={classes.galBar} alt={firstIndex + onScreen + ''} key={firstIndex + onScreen} onClick={(e) => { trackClick(e, 'product-overview', changeIndex) }} />)
      }
      onScreen++;
    }
    return htmlArr;
  }

  function backPhoto() {
    if (mainPhotoIndex > 0) {
      setIndex(mainPhotoIndex - 1);
      if (mainPhotoIndex < photos.length - 3) {
        setBarIndex(mainPhotoIndex - 1);
      } else {
        setBarIndex(photos.length - 4);
      }
    }
  }

  function nextPhoto() {
    if (mainPhotoIndex < photos.length - 1) {
      setIndex(mainPhotoIndex + 1);
    }
    if (mainPhotoIndex < photos.length - 4) {
      setBarIndex(mainPhotoIndex + 1);
    } else {
      setBarIndex(photos.length - 4);
    }
  }

  function lowerBarIndex() {
    if (barIndex > 0) {
      setBarIndex(barIndex - 1);
    }
  }

  function raiseBarIndex() {
    if (barIndex < photos.length - 4) {
      setBarIndex(barIndex + 1);
    }
  }

  return (
    <Grid item container alignItems="center" justifyContent="space-between" xs={10}>
      <Grid item xs={2}>
        <Grid container spacing={3} direction='column'>
          <Grid item xs={1}>
            {barIndex > 0 && <IconButton className={classes.buttonBox} onClick={(e) => { trackClick(e, 'product-overview', lowerBarIndex) }}><KeyboardArrowUpIcon /></IconButton>}
            {barIndex <= 0 && <Box className={classes.buttonBox}></Box>}
          </Grid>
          <Grid item xs={10}>
            <Stack spacing={3}>
              {imgBar(barIndex)}
            </Stack>
          </Grid>
          <Grid item xs={1}>
            {barIndex < photos.length - 4 && <IconButton className={classes.buttonBox} onClick={(e) => { trackClick(e, 'product-overview', raiseBarIndex) }}><KeyboardArrowDownIcon /></IconButton>}
            {barIndex >= photos.length - 4 && <Box className={classes.buttonBox}></Box>}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={1}>
        {mainPhotoIndex > 0 && <IconButton className={classes.buttonBox} onClick={(e) => { trackClick(e, 'product-overview', backPhoto) }}><ArrowBackIcon /></IconButton>}
        {mainPhotoIndex <= 0 && <Box className={classes.buttonBox}></Box>}
      </Grid>
      <Grid item xs={6} container alignItems="center">
      <InnerImageZoom src={photos[mainPhotoIndex].url} zoomScale={3}/>
        {/* <img src={photos[mainPhotoIndex].url} height='auto' width='100%'/> */}
      </Grid>
      <Grid item xs={1}>
        {mainPhotoIndex < photos.length - 1 && <IconButton className={classes.buttonBox} onClick={(e) => { trackClick(e, 'product-overview', nextPhoto) }}><ArrowForwardIcon /></IconButton>}
        {mainPhotoIndex >= photos.length - 1 && <Box className={classes.buttonBox}></Box>}
      </Grid>
    </Grid>
  )
}

function Price(props) {
  const classes = useStyles();
  if (props.sale) {
    return [
      <Typography variant='subtitle1' className={classes.strike} key={0}>${props.price}</Typography>,
      <Typography variant='subtitle1' className={classes.sale} key={1}>${props.sale}</Typography>
    ]
  } else {
    return <Typography variant='subtitle1'>${props.price}</Typography>;
  }
}

function Overview(props) {
  const classes = useStyles();
  const [pid, setPID] = useState(props.productId);
  const [style, setStyle] = useState({});
  const [styleIndex, setStyleIndex] = useState(0);
  const [styles, setStyles] = useState([{ photos: [{ url: '', thumbnail_url: '' }, { url: '', thumbnail_url: '' }] }]);
  const [productInfo, setProductInfo] = useState({});
  const [stylePhotos, setPhotos] = useState([{ url: '', thumbnail_url: '' }, { url: '', thumbnail_url: '' }]);
  const [isExpanded, setExpand] = useState(false);
  const [avgRating, setRating] = useState(0);
  const [numOfReviews, setNumOfReviews] = useState(0);
  useEffect(() => {
    setStyle(styles[styleIndex]);
    setPhotos([...styles[styleIndex].photos]);
  }, [styleIndex, styles])
  useEffect(() => {
    setPID(props.productId);
  }, [props])
  useEffect(() => {
    getRating(pid)
      .then(({ data }) => {
        let total = 0;
        let numReviews = 0;
        for (let key in data.ratings) {
          total += parseInt(key) * data.ratings[key];
          numReviews += parseInt(data.ratings[key]);
        }
        setNumOfReviews(numReviews);
        setRating(total / numReviews);
      })
      .catch(err => { console.log('failed to get rating', err) })
    getProductStyles(pid)
      .then((response) => {
        setStyles(response.data.results);
        setStyle(response.data.results[styleIndex]);
        setPhotos([...response.data.results[styleIndex].photos]);
      })
      .catch((err) => { console.log('styles', err) });
    getProduct(pid)
      .then((response) => {
        setProductInfo(response.data);
        props.grabName(response.data.name);
      })
      .catch((err) => { console.log('info', err) });
  }, [pid])

  function changeIndex(index) {
    setStyleIndex(index);
  }

  function fullscreenToggle() {
    setExpand(!isExpanded);
  }
  if (isExpanded) {
    return (
      <Grid container justifyContent="center" direction="row">
        <Gallery photos={stylePhotos} />
        <Grid item xs={1}>
          <IconButton onClick={(e) => { trackClick(e, 'product-overview', fullscreenToggle) }}><FullscreenExitIcon /></IconButton>
        </Grid>
      </Grid>
    )
  } else {
    return (
      <Container maxWidth="xl">
        <Grid
          container
          spacing={1}
        >
          <Grid item xs={12} md={8} container justifyContent="center" direction="row">
            <Gallery photos={stylePhotos} />
            <Grid item xs={1}>
              <IconButton onClick={(e) => { trackClick(e, 'product-overview', fullscreenToggle) }}><FullscreenIcon /></IconButton>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} container direction="column" alignItems="flex-start" justifyContent="flex-start">
            <Grid item container direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
              <Grid item>
                <Rating name="quarter-rating" value={avgRating} readOnly precision={0.25} />
              </Grid>
              <Grid item>
                <Link href="#ratings" underline="always" color="textSecondary">
                  {`Read all ${numOfReviews} reviews`}
                </Link>
              </Grid>
            </Grid>
            <Typography variant='h6' color="textSecondary">{productInfo.category}</Typography>
            <Typography gutterBottom variant='h3'>{productInfo.name}</Typography>
            {/* price still needs sale update*/}
            {/* <Typography variant='subtitle1'>${productInfo.default_price}</Typography> */}
            <Price price={style.original_price} sale={style.sale_price} />
            <StyleSelect styleIndex={styleIndex} style={style} styles={styles} changeIndex={(e) => { changeIndex(e) }} />
            <AddToCart style={style} />
            <Paper elevation={1} className={classes.productInfoComponent}>
              <Typography variant='subtitle2' className={classes.descText}>{productInfo.description}</Typography>
            </Paper>
          </Grid>
        </Grid>

      </Container>
    )
  }
}



export default Overview;