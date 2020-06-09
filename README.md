# actions-download-file
An action used to filter out a URL and download files for further works.

## Usage

To use this action, add it into your workflow file. You can directly give it an URL:

``` yaml
- uses: suisei-cn/actions-download-file@v1
  id: downloadfile  # Remember to give an ID if you need the output
  name: Download the file
  with:
    url: "https://cdn.jsdelivr.net/npm/workbox-sw@5.1.3/build/workbox-sw.min.js"
    target: public/
```

You can also let it pick the first `[]()` format URL from Markdown:

``` yaml
- uses: suisei-cn/actions-download-file@v1
  id: downloadfile  # Remember to give an ID if you need the output
  name: Download the file
  with:
    url: "The vendor we are using is [this](https://cdn.jsdelivr.net/npm/workbox-sw@5.1.3/build/workbox-sw.min.js)!"
    target: public/
    auto-match: true
```

Finding the first `[]()` format URL from a comment event is also okay, which is the primary aim of this action:

``` yaml
- uses: suisei-cn/actions-download-file@v1
  id: downloadfile  # Remember to give an ID if you need the output
  name: Download the file
  with:
    url: ${{ github.event.comment.body }}
    target: public/
    auto-match: true
```

## `with`
* url: The URL, or the Markdown text containing an URL
* target: The target directory where the downloaded file lies. Will be automatically created if not exists.
* auto-match: (optional, default `false`) If we find the URL from the text, or use the `url` parameter directly as the URL.

## Output
* filename: The written file name.

## How `auto-match` works?
It attempts to find the first URL with the format `(url)`, such as `(https://g.co)`, which is the common way to embed an `<a>` into Markdown.

## Will it fail?
This action WILL fail if it cannot finish its job, including but not limited to the cases when:

* No URL is provided
* The file cannot be downloaded
* It cannot find an URL with the format `(url)`

## Examples
* <https://github.com/suisei-cn/starbuttons/blob/master/.github/workflows/auto_pr.yml>

## License
MIT
