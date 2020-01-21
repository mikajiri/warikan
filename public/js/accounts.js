$(document).ready(() => {
    loadTable(10)
})

$(document).on('click', '.btnpay', function() {
    let msg = "支払い済みにしますか？"
    if (window.confirm(msg)) {
        let id = $(this).attr('data-aid')
        $.ajax({
            url: '/items/pay/'+id,
            type: 'PUT',
        })
        .done(data => {
            loadTable(currentRowNum())
        })
    }
})

$(document).on('click', '#btn-payall', function() {
    let msg = "支払い済みにしますか？"
    if (window.confirm(msg)) {
        $.ajax({
            url: '/items/payall',
            type: 'PUT'
        })
        .done(data => {
            loadTable(currentRowNum())
        })
    }
})

$(document).on('click', '#btn-reg', function() {
    let rownum = Math.max(currentRowNum(), 10)
    $('#btn-reg').prop('disabled', true)
    let item = $('#reg-item-name').val()
    let price = parseInt($('#reg-item-price').val())
    let errors = []
    if (item == '') {
        errors.push('商品名を入力してください。')
    }
    if (!Number.isInteger(price)) {
        errors.push('金額は整数値を入力してください。')

    }
    if (errors.length) {
        let html = `
        <div class="alert alert-danger alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            ${errors.join('<br>')}
        </div>
        `
        $('#register').append(html)
        return
    }
    let cid = location.pathname.split('/').pop()
    console.log('before ajax')
    $.ajax({
        url: '/items',
        type: 'POST',
        data: `item=${item}&creditorId=${cid}&price=${price}`
    })
    .done(data => {
        console.log('done ajax')
        loadTable(rownum)
    })
    .fail(err => {
        console.log(err)
    })
    .always(() => {
        $('#btn-reg').prop('disabled', false)
    })
    $('#reg-item-name').val('')
    $('#reg-item-price').val('')
})

$(document).on('change', '.cb-filter', filterRows)

$(document).on('click', '#viewmore', function() {
    let offset = currentRowNum()
    let limit = 10
    console.log({l: limit, o: offset})
    $.ajax({
        url: `/items?limit=${limit}&offset=${offset}`,
        type:'GET'
    })
    .done(data => {
        for (let row of data) {
            let html = `
            <tr data-cid="${row.creditorId}" data-payed="${row.payed}">
                <td class="text-center">${row.creditor}</td>
                <td class="text-center">${row.item}</td>
                <td class="text-center">${row.purchasedAt}</td>
                <td class="text-center">¥${row.price}</td>
                <td class="text-center align-middle">
                    ${row.payed 
                        ? '<div><i style="color: #28a745" class="fas fa-check fa-xs"></i></div>' 
                        : `<div data-aid="${row.id}" class="btnpay"></div>`
                    }
                </td>
            </tr>
            `
            $('#tbl-main > tbody').append(html)
        }
    })
    filterRows()
})

function currentRowNum() {
    return $('#tbl-main tbody tr').length
}

function filterRows() {
    let me = location.pathname.split('/').pop()
    $('#tbl-main tbody tr').show()
    let cUnpayed = $('#cb-filter-unpayed').prop('checked')
    let cSelf = $('#cb-filter-self').prop('checked')

    if (cUnpayed) {
        $('#tbl-main tbody tr[data-payed=true]').hide()
    }
    if (cSelf) {
        $(`#tbl-main tbody tr:not([data-cid=${me}])`).hide()
    }
}

function loadTable(limit = 10, offset = 0) {
    let me = location.pathname.split('/').pop()
    $('#tbl-main tbody').empty()
    $('#btn-summary-wrap').empty()
    $.ajax({
        url: `/items?limit=${limit}&offset=${offset}`,
        type: 'GET'
    })
    .done(data => {
        // table
        for (let row of data) {
            let html = `
            <tr data-cid="${row.creditorId}" data-payed="${row.payed}">
                <td class="text-center">${row.creditor}</td>
                <td class="text-center">${row.item}</td>
                <td class="text-center">${row.purchasedAt}</td>
                <td class="text-center">¥${row.price}</td>
                <td class="text-center align-middle">
                    ${row.payed 
                        ? '<div><i style="color: #28a745" class="fas fa-check fa-xs"></i></div>' 
                        : `<div data-aid="${row.id}" class="btnpay border"></div>`
                    }
                </td>
            </tr>
            `
            $('#tbl-main > tbody').append(html)
        }
        // summary
        console.log(me)
        let myTotal = data
                .filter(x => x.creditorId == me && !x.payed)
                .map(x => x.price)
                .reduce((a, c) => parseInt(a) + parseInt(c), 0)
        let otherTotal = data
                .filter(x => x.creditorId != me && !x.payed)
                .map(x => x.price)
                .reduce((a, c) => parseInt(a) + parseInt(c), 0)

        if (myTotal > otherTotal) {
            $('#summary').html(`<span class="text-primary">+¥${myTotal - otherTotal}</span>`)
            $('#btn-summary-wrap').append(`<button class="btn btn-info" id="btn-payall">すべて精算</button>`)
        } else if (myTotal < otherTotal) {
            $('#summary').html(`<span class="text-danger">-¥${otherTotal - myTotal}</span>`)
            $('#btn-summary-wrap').append(`<button class="btn btn-danger" id="btn-payall">すべて精算</button>`)
        } else {
            $('#summary').html(`<span class="text-success">¥0</span>`)
        }
        filterRows()
    })
}