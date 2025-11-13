import { VeryfiDocument } from "@veryfi/veryfi-sdk/lib/types/VeryfiDocument";

export type Receipt = {
    account_number:            null | string;
    cashback:                  null;
    category:                  string;
    created_date:              Date;
    currency_code:             string;
    date:                      Date | null;
    delivery_date:             null;
    discount:                  number | null;
    document_reference_number: null | string;
    document_title:            null;
    document_type:             string;
    due_date:                  null;
    duplicate_of:              null;
    external_id:               null;
    id:                        number;
    img_file_name:             string;
    img_thumbnail_url:         string;
    img_url:                   string;
    insurance:                 null;
    invoice_number:            null | string;
    is_duplicate:              boolean;
    is_money_in:               boolean;
    line_items:                LineItem[];
    meta:                      Meta;
    notes:                     null;
    ocr_text:                  string;
    order_date:                null;
    payment:                   Payment;
    pdf_url:                   string;
    purchase_order_number:     null;
    reference_number:          string;
    rounding:                  null;
    service_end_date:          null;
    service_start_date:        null;
    shipping:                  null;
    store_number:              null | string;
    subtotal:                  number;
    tags:                      any[];
    tax:                       number | null;
    tax_lines:                 TaxLine[];
    tip:                       null;
    total:                     number;
    total_weight:              null;
    tracking_number:           null;
    updated_date:              Date;
    vendor:                    Vendor;
}

export type LineItem = {
    date:                   null;
    description:            null | string;
    discount:               number | null;
    discount_rate:          null;
    end_date:               null;
    full_description:       null | string;
    hsn:                    null;
    id:                     number;
    lot:                    null;
    normalized_description: null | string;
    order:                  number;
    price:                  number | null;
    quantity:               number;
    reference:              null;
    section:                null | string;
    sku:                    null | string;
    start_date:             null;
    tags:                   any[];
    tax:                    number | null;
    tax_rate:               null;
    text:                   string;
    total:                  number | null;
    type:                   Type | null;
    unit_of_measure:        null | string;
    upc:                    null;
    weight:                 null;
}

export enum Type {
    Alcohol = "alcohol",
    Discount = "discount",
    Fee = "fee",
    Food = "food",
    Product = "product",
}

export type Meta = {
    language:         string[];
    ocr_score:        number;
    owner:            string;
    pages:            Array<null[] | PageClass>;
    processed_pages:  number;
    source:           string;
    source_documents: Array<null[] | SourceDocumentClass>;
    total_pages:      number;
}

export type PageClass = {
    height:   number;
    language: string[];
    width:    number;
}

export type SourceDocumentClass = {
    height:  number;
    size_kb: number;
    width:   number;
}

export type Payment = {
    card_number:  null | string;
    display_name: null | string;
    terms:        null;
    type:         null | string;
}

export type TaxLine = {
    base:  null;
    name:  null;
    order: number;
    rate:  number;
    total: number;
}

export type Vendor = {
    account_number: null;
    address:        null | string;
    category:       null | string;
    email:          null | string;
    lat:            number | null;
    lng:            number | null;
    logo:           string;
    name:           string;
    phone_number:   null | string;
    raw_address:    null | string;
    raw_name:       string;
    type:           null | string;
    vat_number:     null | string;
    web:            null | string;
}

export function toReceipt(json: string): Receipt {
    console.log(json);
    console.log(typeof json);
    return JSON.parse(json);
}

export function parseReceiptData(data: VeryfiDocument): Receipt {
    return {
        account_number: null,
        cashback: null,
        category: '',
        created_date: new Date(),
        currency_code: typeof data.currency_code === 'string' ? data.currency_code : '',
        date: typeof data.date === 'string' ? new Date(data.date) : null,
        delivery_date: null,
        discount: null,
        document_reference_number: null,
        document_title: null,
        document_type: '',
        due_date: null,
        duplicate_of: null,
        external_id: null,
        id: data.id ?? 0,
        img_file_name: '',
        img_thumbnail_url: '',
        img_url: '',
        insurance: null,
        invoice_number: null,
        is_duplicate: false,
        is_money_in: false,
        line_items: data.line_items?.map((item) => ({
            date: null,
            description: typeof item.description === 'string' ? item.description : null,
            discount: typeof item.discount === 'number' ? item.discount : null,
            discount_rate: null,
            end_date: null,
            full_description: typeof item.full_description === 'string' ? item.full_description : null,
            hsn: null,
            id: item.id ?? 0,
            lot: null,
            normalized_description: typeof item.normalized_description === 'string' ? item.normalized_description : null,
            order: item.order ?? 0,
            price: typeof item.price === 'number' ? item.price : null,
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            reference: null,
            section: typeof item.section === 'string' ? item.section : null,
            sku: typeof item.sku === 'string' ? item.sku : null,
            start_date: null,
            tags: item.tags ?? [],
            tax: typeof item.tax === 'number' ? item.tax : null,
            tax_rate: null,
            text: typeof item.text === 'string' ? item.text : '',
            total: typeof item.total === 'number' ? item.total : null,
            type: item.type && Object.values(Type).includes(item.type as Type) ? item.type as Type : null,
            unit_of_measure: typeof item.unit_of_measure === 'string' ? item.unit_of_measure : null,
            upc: null,
            weight: null
        })) ?? [],
        meta: {
            language: [],
            ocr_score: 0,
            owner: '',
            pages: [],
            processed_pages: 0,
            source: '',
            source_documents: [],
            total_pages: 0
        },
        notes: null,
        ocr_text: '',
        order_date: null,
        payment: {
            card_number: null,
            display_name: null,
            terms: null,
            type: null
        },
        pdf_url: '',
        purchase_order_number: null,
        reference_number: '',
        rounding: null,
        service_end_date: null,
        service_start_date: null,
        shipping: null,
        store_number: null,
        subtotal: 0,
        tags: [],
        tax: null,
        tax_lines: [],
        tip: null,
        total: typeof data.total === 'number' ? data.total : 0,
        total_weight: null,
        tracking_number: null,
        updated_date: new Date(),
        vendor: {
            account_number: null,
            name: typeof data.vendor?.name === 'string' ? data.vendor.name : '',
            logo: typeof data.vendor?.logo === 'string' ? data.vendor.logo : '',
            raw_name: typeof data.vendor?.raw_name === 'string' ? data.vendor.raw_name : '',
            address: typeof data.vendor?.address === 'string' ? data.vendor.address : null,
            phone_number: typeof data.vendor?.phone_number === 'string' ? data.vendor.phone_number : null,
            raw_address: typeof data.vendor?.raw_address === 'string' ? data.vendor.raw_address : null,
            lat: data.vendor?.lat ?? null,
            lng: data.vendor?.lng ?? null,
            web: typeof data.vendor?.web === 'string' ? data.vendor.web : null,
            category: typeof data.vendor?.category === 'string' ? data.vendor.category : null,
            vat_number: typeof data.vendor?.vat_number === 'string' ? data.vendor.vat_number : null,
            type: typeof data.vendor?.type === 'string' ? data.vendor.type : null,
            email: typeof data.vendor?.email === 'string' ? data.vendor.email : null
        }
    }
}