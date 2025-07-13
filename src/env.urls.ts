const prod = {
    url: {
        APP_URL: "https://casanova.jonas-alexander.dk",
        API_URL: "https://casanova-laravel-backend.ey.r.appspot.com",
    },
    mobilepay: {
        MP_CLIENT_ID: "",
        MP_CLIENT_SECRET: "",
        MP_KEY: "",
        MP_SESSION_API: "",
        MP_MSN: "",
    }
}

const dev = {
    url: {
        APP_URL: "http://localhost:3000",
        API_URL: "http://localhost:8000",
        // API_URL: "http://192.168.0.186:8000",
    },
    mobilepay: {
        MP_CLIENT_ID: "",
        MP_CLIENT_SECRET: "",
        MP_KEY: "",
        MP_SESSION_API: "",
        MP_MSN: "",
    }
}
export const env = process.env.NODE_ENV === 'development' ? dev : prod

export const paths = {
    API_ROUTE: "/api/"
}
