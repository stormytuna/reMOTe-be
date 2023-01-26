exports.patchKeysAreEqual = (providedKeys, expectedKeys) => {
    for (let i = 0; i < expectedKeys.length; i++) {

        let N = providedKeys.length;
        let M = expectedKeys.length;
 
        if (N != M) return false;
 
        providedKeys.sort();
        expectedKeys.sort();
 
        for (let i = 0; i < N; i++)
            if (providedKeys[i] != expectedKeys[i])
                return false;
 
        return true;
    }
    }