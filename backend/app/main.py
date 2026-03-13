from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Cho phép Frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputStrings(BaseModel):
    str1: str
    str2: str

@app.post("/solve")
def solve_lcs(data: InputStrings):
    s1 = data.str1
    s2 = data.str2
    m, n = len(s1), len(s2)

    dp = [[0 for _ in range(n + 1)] for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    path = []
    i, j = m, n
    lcs_str = ""
    
    while i > 0 and j > 0:

        if s1[i - 1] == s2[j - 1]:
            path.append({"r": i, "c": j, "type": "match"})
            lcs_str = s1[i - 1] + lcs_str
            i -= 1
            j -= 1

        elif dp[i - 1][j] > dp[i][j - 1]:

            path.append({"r": i, "c": j, "type": "up"})
            i -= 1
        else:

            path.append({"r": i, "c": j, "type": "left"})
            j -= 1
            
 
    path.append({"r": i, "c": j, "type": "end"})

    return {
        "matrix": dp,
        "path": path,
        "lcs": lcs_str,
        "m": m,
        "n": n
    }