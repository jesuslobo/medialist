import ErrorPage from "@/components/layouts/ErrorPage";

export default function Error404Page() {

    return (
        <ErrorPage MainMessage="404" message="Page Not Found" hideTryAgain />
    )
}