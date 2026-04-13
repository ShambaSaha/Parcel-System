

/**
 * Calculates the volume of a package given its dimensions.
 *
 * @param {number} length - The length of the package.
 * @param {number} breadth - The breadth of the package.
 * @param {number} height - The height of the package.
 * @returns {number} The calculated volume of the package.
 * @throws {Error} If any of the dimensions are not positive numbers.
 * 
 *  Example usage:
 *  const volume = calculateVolume(10, 5, 2);
 *  console.log(volume) // Output: 100
 */
function calculateVolumePacking(largerVolume, smallBoxes) {
    // Calculate total larger volume
    const totalLargerVolume =
        largerVolume.length *
        largerVolume.breadth *
        largerVolume.height;

    // Track packed boxes and volume
    const packedBoxes = [];
    let totalPackedVolume = 0;

    // Iterate through each small box
    for (const box of smallBoxes) {
        // Calculate current box volume
        const boxVolume = box.length * box.breadth * box.height;

        // Check if box can fit in remaining volume
        if (totalPackedVolume + boxVolume <= totalLargerVolume) {
            packedBoxes.push(box);
            totalPackedVolume += boxVolume;
        }
    }

    // Calculate remaining volume
    const remainingVolume = totalLargerVolume - totalPackedVolume;

    // Return results
    return {
        totalLargerVolume,
        packedBoxes,
        totalPackedVolume,
        remainingVolume,
        packingEfficiency: (totalPackedVolume / totalLargerVolume) * 100
    };
}



/**
 * Calculates the volume of a cuboid given its length, breadth, and height.
 *
 * @param {number} length - The length of the cuboid.
 * @param {number} breadth - The breadth of the cuboid.
 * @param {number} height - The height of the cuboid.
 * @returns {number} The calculated volume of the cuboid.
 * @throws {Error} If any of the dimensions are not positive numbers or not numbers at all.
 *
 * @example
 * const volume = calculateVolume(10, 5, 2); // Returns 100
 */
function calculateVolume(length, breadth, height) {
    // Validate input to ensure all parameters are numbers and positive
    if (typeof length !== 'number' || typeof breadth !== 'number' || typeof height !== 'number') {
        throw new Error('All dimensions must be numbers');
    }

    if (length <= 0 || breadth <= 0 || height <= 0) {
        throw new Error('All dimensions must be positive numbers');
    }

    // Calculate and return the volume
    return length * breadth * height;
}


export {
    calculateVolume,
    calculateVolumePacking
}