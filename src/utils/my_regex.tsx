/*
Liscence: GNU General Public License v2.0
Author: Chandler Clevenger
Date: 3/26/2023
*/

export default class myRegex {
  getNumbersOnly(s: string) {
    return s.replace(/^\D+/g, "");
  }
}
