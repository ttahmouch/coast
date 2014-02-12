hapi('DogeCoin Wallet API')
    .path('/Users/ttahmouch/Desktop/git/dogewallet-hapi/')
    .meta({
        'Host': 'dogewallet.hapi.co',
        'Accept': 'multipart/nav-data'
    })
    .req('entry', 'GET', '/').use('entry.js')
    .res('200', [
        'entry', 'getBalance', 'postWithdraw', 'postPaymentAddress', 'getAddresses', 'getAddressByLabel',
        'getDifficulty', 'getCurrentBlock', 'whoops'
    ])
    .req('getBalance', 'GET', '/balance').use('getBalance.js')
    .res('200', ['entry'])
    .req('postWithdraw', 'POST', '/withdraw').use('postWithdraw.js')
    .meta({
        'Content-Type': 'application/vnd.dogewallet.co.withdraw+json',
        'Authorization': 'Basic'
    })
    .input({ _id: 'amount', _value: '' })
    .input({ _id: 'address', _value: '' })
    .res('200', ['entry'])
    .req('postPaymentAddress', 'POST', '/addresses').use('postPaymentAddress.js')
    .meta({ 'Content-Type': 'application/vnd.dogewallet.co.address+json' })
    .input({ _id: 'label', _value: '' })
    .res('200', ['entry'])
    .req('getAddresses', 'GET', '/addresses').use('getAddresses.js')
    .res('200', ['entry'])
    .req('getAddressByLabel', 'GET', '/addresses/{label}').use('getAddressByLabel.js')
    .res('200', ['entry'])
    .req('getDifficulty', 'GET', '/difficulty').use('getDifficulty.js')
    .res('200', ['entry'])
    .req('getCurrentBlock', 'GET', '/block').use('getCurrentBlock.js')
    .res('200', ['entry'])
