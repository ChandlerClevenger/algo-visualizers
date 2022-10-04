export default class myRegex {
  getNumbersOnly(s: string) {
    return s.replace(/^\D+/g, "");
  }
}
