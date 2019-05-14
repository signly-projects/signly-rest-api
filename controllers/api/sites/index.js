exports.getSites = (req, res, next) => {
    // fetch web sites from DB
    res.status(200).json({
        sites: [
            {
                id: '1',
                title: 'Lloyds',
                baseUrl: 'https://www.lloydsbank.com',
                company: {
                    id: '1',
                    name: 'Lloyds'
                }
            },
            {
                id: '2',
                title: 'Lloyds',
                baseUrl: 'https://www.lloydsbankacademy.co.uk',
                company: {
                    id: '1',
                    name: 'Lloyds'
                }
            },
            {
                id: '3',
                title: 'Barclays',
                baseUrl: 'https://www.barclays.co.uk',
                company: {
                    id: '2',
                    name: 'Barclays'
                }
            }
        ]
    });
};

exports.createSite = (req, res, next) => {
    // (try to) fetch web site details using 'req.body.siteUrl' from DB
    const site = {
        id: '1',
        title: req.body.title,
        baseUrl: req.body.url,
        company: {
            id: '1',
            name: req.body.companyName,
        }
    }
    // Return create status AND the created web site object
    res.status(201).json({
        message: 'Site created successfully.',
        site: site
    });
};
