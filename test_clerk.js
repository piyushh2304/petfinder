import * as clerk from '@clerk/clerk-sdk-node';
console.log("EXPORTS:", Object.keys(clerk));

import pkg from '@clerk/clerk-sdk-node';
console.log("DEFAULT EXPORT:", pkg ? Object.keys(pkg) : "NO DEFAULT EXPORT");
