const reformatAgeCategories = (ageRange) => {
    return ageRange.split(',').map(category => {
        const [categoryName, ageRange] = category.split(':');
        return { categoryName, ageRange };
    });
};



module.exports = { reformatAgeCategories, };