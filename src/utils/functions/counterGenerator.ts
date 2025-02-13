export default function* counterGenerator() {
    let count = 0
    while (true) {
        yield count++
    }
}