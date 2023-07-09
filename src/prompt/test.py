# imports
import ast  # for converting embeddings saved as strings back to arrays
import openai  # for calling the OpenAI API
import pandas as pd  # for storing text and embeddings data
import tiktoken  # for counting tokens
from scipy import spatial  # for calculating vector similarities for search
import os
import re  # for cutting <ref> links out of Wikipedia articles
import mwclient  # for downloading example Wikipedia articles
import mwparserfromhell  # for splitting Wikipedia articles into sections
# models

EMBEDDING_MODEL = "text-embedding-ada-002"
GPT_MODEL = "gpt-3.5-turbo"

openai.api_key = "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"

query = 'Which athletes won the gold medal in curling at the 2022 Winter Olympics?'
df = pd.read_csv('C:/Users/16430/Downloads/winter_olympics_2022.csv')
print(df)


response = openai.ChatCompletion.create(
    messages=[
        {'role': 'system', 'content': 'You answer questions about the 2022 Winter Olympics.'},
        {'role': 'user', 'content': query},
    ],
    model=GPT_MODEL,
    temperature=0,
)

print(response['choices'][0]['message']['content'])