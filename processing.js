const MAX_DIM_SIZE = 20;
let model;

async function loadModel() {
    model = await tf.loadGraphModel('TFJS/model.json');
}

function predictImage() {

    //console.log('processing');

    // Read image with OpenCV (cv)
    let image = cv.imread(canvas);

    // Convert image to grayscale, one single color channel: input: image; as output we overwrite the image (use image), color rgb to grayscale, channel = 0 means it takes it from the cv.color
    cv.cvtColor(image, image, cv.COLOR_RGB2GRAY, 0);

    // Increase contrast: save WHITE line; use threshold function --> all the pixels above the threshold 175 are white 255 in a binary fashion.
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

    // Calculate contours of the image
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // Calculate Bounding Rectangle
    let cnt = contours.get(0)  // Subset of contours
    rect = cv.boundingRect(cnt);  // Calculate rectangle
    image = image.roi(rect);  // CROP image

    // Resize the image
    var height = image.rows;
    var width = image.cols;
    if (height > width) {
        height = 20;
        const scaling_fct = image.rows / 20;
        width = Math.round(image.cols / scaling_fct);
    } else if (height < width) {
        width = 20;
        const scaling_fct = image.cols / 20;
        height = Math.round(image.rows / scaling_fct);
    }
    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

    // Add padding
    const LEFT = Math.ceil(4 + (20 - width)/2);
    const RIGHT = Math.floor(4 + (20 - width) / 2);
    const TOP = Math.ceil(4 + (20 - height) / 2);
    const BOTTOM = Math.floor(4 + (20 - height) / 2);
    //console.log(TOP, BOTTOM, LEFT, RIGHT);
    // BLACK = border color
    const BLACK = new cv.Scalar(0, 0, 0, 0);
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    // Center of Mass
    // Find contours of NEW image
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);  // false = NO binary image
    // m10 = mass along the x-direction
    // m01 = mass along the y-direction
    // m00 = overall mass
    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;
    //console.log(Moments.m00, cx, cy);
    
    // Shift the image so that the center of image == center of mass (14 is half size incl padding == image.cols/2.0 or image.rows/2.0)
    const X_SHIFT = Math.round(image.cols/2.0 - cx);
    const Y_SHIFT = Math.round(image.rows/2.0 - cy);
    //https://docs.opencv.org/3.4.9/dd/d52/tutorial_js_geometric_transformations.html
    const shift_matrix = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    const image_size = new cv.Size(image.rows, image.cols);
    cv.warpAffine(image, image, shift_matrix, image_size, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    // Normalize Pixel values
    // Transform to Float32 (image.data is INT!)
    let pixelValues = Float32Array.from(image.data);
    // Use map to normalize!
    pixelValues = pixelValues.map(pixel => pixel / 255.0);
    //console.log(pixelValues); // 0 - 1 (784 cols)
    
    // Create a tensor
    const X = tf.tensor([pixelValues]);
    //console.log(X.shape);  // shape
    //console.log(X.dtype);  // data type

    // Make predictions (model is loaded before!)
    // result is also a TENSOR!!
    let result = model.execute({'X': X}, ['accuracy_calc/prediction']);
    result.print();

    // Get values out of a tensor with dataSync()
    // Returns an array, need only the first 
    const output = result.dataSync()[0];

    // Testing only
    //const outputCanvas = document.createElement('CANVAS');
    //cv.imshow(outputCanvas, image);
    //document.body.appendChild(outputCanvas);

    // Clean up
    image.delete();
    contours.delete();
    cnt.delete();
    hierarchy.delete();
    shift_matrix.delete();
    X.dispose(); // free memory: dispose() comes from tf
    result.dispose();

    return output;
}