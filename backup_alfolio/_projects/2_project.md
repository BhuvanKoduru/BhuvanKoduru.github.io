---

importance: 2
# giscus_comments: true

img: assets/img/rag.png
layout: page
title: "RAG with Citations for SEC 10K tickers"
description: Implementation of Retrieval-Augmented Generation (RAG) with source citations.
importance: 2
repo: "RAG-with-citations"
category: fun
tags:
  - RAG
  - NLP
  - Retrieval
---
---
# General Timeline

- This is an overview of the project's timeline, detailing various tasks, tools, and methodologies used during the development of this project.
- Link to project [demo video](https://drive.google.com/file/d/1Sy59AYZY4ukoZ6Aae_VGEh_7wsh5sJrP/view?usp=drive_link)
- The file ms.png was the one used for Visual QnA using LlaVa, it has been uploaded here.
  
## Tasks and Tools Overview
1. **Understanding 10-K Filings and company tickers:**
   - Watched a [YouTube video](https://www.youtube.com/watch?v=Q0o9S0q0Rr4) to grasp the concept of 10-K filings.
   - Learned about their contents and how to skim through them efficiently.
   - What is a company ticker?
A ticker symbol is a stock symbol; an abbreviation of a company's name that uniquely identifies its publicly traded shares on stock exchanges. 



2. **Exploring SEC-EDGAR:**
   - Explored the Securities and Exchange Commission's Electronic Data Gathering, Analysis, and Retrieval system (SEC-EDGAR).


3. **Downloading and Formatting Filings:**
   - Used the `sec_edgar_downloader` library to download 10-K filings.
   - Developed scripts to add HTML tags for proper formatting.
   - Utilized parameters for human-readable formats like HTML.
   - While reading the documentation of the method, I saw a parameter which was useful for human readable formats like .html etc. So I used that parameter. This gave me .html documents. I didn't need to extract any html content. 


4. **Organizing and Renaming Files:**
   - Developed a Python script to organize and rename folders and corresponding HTML files based on their year.

5. **Introduction to RAG (Retrieval Augmented Generation):**
   - The task of getting insights from a document unseen to an LLM can be achieved using RAG (Retrieval Augmented Generation). I had prior experience doing it, so I thought that’s what I’d try. I wanted to make a chatbot-like application interface.
   - Planned to create a chatbot-like application interface.
   - I had only worked with PDF or text files, never with html files. I had to read the documentation and load html files. Then I learnt how to load multiple documents at once.

6. **Experimenting with Models:**
   - Explored various models including OpenAI (Did not have access tokens), HuggingFace, Local models using ollama such as LLama2,3, phi3, mistral and LlaVa, and Anthropic AI's Claude-3-Opus.
   - Evaluated models like Intel/dynamictinybert, deepset/roberta-base-squad2, claude-3-opus, etc.

7. **Front-end Development with Streamlit:**
   - Chose Streamlit for its easy integration with Python and multi-page application support.
   - I learnt about session state and variables, since values are not stored across pages in a streamlit application. Some variables such as the ticker chosen, had to be shared across pages. 



### Task 1.1: Data Retrieval
- Selected companies: Apple, Microsoft, Visa, Nvidia.
- Retrieved 10-K filings using tickers and downloaded HTML files.
- Used the `download_details` argument for obtaining HTML files.
- Combined relevant HTML files into folders and loaded them using langchain's document loader.
- Split data into chunks and created a FAISS database for similarity search based on user queries.
- I found the JSON mapping a company name to its ticker from the EDGAR website, which was extremely helpful.

ticker= input("Enter company ticker: ")

from sec_edgar_downloader import Downloader


dl = Downloader("MyCompanyName", "my_mail@email_provider.com")

dl.get("10-K", ticker, after="1995-01-01", before="2023-12-31", download_details=True)

The “download_details” argument was of utmost help, since it gave me html files instead of just plaintext files.


### Task 1.2: Data Collection, preprocessing and Text Analysis from 10-K Filings
- 10-K filings are complex and lengthy, requiring insights extraction.
- Planned to use LLMs to quickly generate insights such as sales trends, risk factors, and product sales breakdown.
- Why would a user care?
- 10-K filings are extremely long and tedious for humans to read through and understand. With the amount of context modern-day LLMs can sift through and store, using them would be a great way to quickly generate insights such as:
- What are the sales of a particular financial year?
- How was the trend in the past few years?
- What are the risk factors of the company?
- What is the device based split up of sales in an electronics company such as Apple?
- These insights will help the user make informed decisions, after manual verification, about various aspects such as investments or job opportunities or for a general understanding of the indstry the company is in.



## Task 2: Application Construction and Deployment

- Chose Python as the backend language due to its compatibility with all LLMs, and my proficiency in it.
- Selected Streamlit for its ease of integration with existing Python code.
- Utilized Streamlit's capability to build multi-page applications that run quickly.

- Created a homepage for selecting company tickers and timeframes.
- Implemented separate pages for different LLMs, enabling users to chat with them.
- Introduced multi-modality with LlaVa for analyzing uploaded images.
- Deployed visualizations generated by Claude's answers using QuickChart. 

The visualizations generated by Claude's answers are shown as links below:

- [Pie Chart - Apple Device Sales](https://quickchart.io/chart?c={type:%27pie%27,data:{labels:[%27iPhone%27,%27Services%27,%27Mac%27,%27iPad%27,%27Wearables,%20Home%20and%20Accessories%27],datasets:[{data:[164888,39748,25198,18380,17381]}]}})
- [Bar Chart - Apple Total Net Sales](https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[%272016%27,%272017%27,%272018%27],datasets:[{label:%27Total%20Net%20Sales%20($%20millions)%27,data:[215639,229234,265595]}]}})
- [Bar Chart - Apple Total Net Sales (2015-2017)](https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[%272015%27,%272016%27,%272017%27],datasets:[{label:%27Total%20Net%20Sales%20(millions)%27,data:[233715,215639,229234]}]},options:{scales:{yAxes:[{ticks:{beginAtZero:true}}]}}})
- [Bar Chart - Apple Total Net Sales (2016-2018)](https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[%272016%27,%272017%27,%272018%27],datasets:[{label:%27Total%20Net%20Sales%20(millions)%27,data:[215639,229234,265595]}]},options:{plugins:{datalabels:{anchor:%27end%27,align:%27end%27,color:%27black%27}}}})
- [Bar Chart - Apple Total Net Sales (2015-2018)](https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[%272015%27,%272016%27,%272017%27,%272018%27],datasets:[{label:%27Total%20Net%20Sales%20(millions)%27,data:[233715,215639,229234,265595]}]}})
- [Shown in the demo:](https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[%272015%27,%272016%27,%272017%27],datasets:[{label:%27Total%20Net%20Sales%20(millions)%27,data:[233715,215639,229234]}]}})

